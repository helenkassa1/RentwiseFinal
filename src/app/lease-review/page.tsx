"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/shared";
import {
  FileText,
  Loader2,
  ArrowRight,
  Scale,
  AlertTriangle,
  AlertCircle,
  Info,
  Upload,
  Check,
  X,
  Flag,
  Download,
  ChevronDown,
  ChevronUp,
  Undo2,
  Redo2,
  Pencil,
  Check as CheckIcon,
} from "lucide-react";
import {
  AIPreAnalysisDisclaimer,
  ConfidenceBadge,
  PerSuggestionDisclaimer,
} from "@/components/ai-disclaimer-bar";
import { MainNav } from "@/components/navigation/main-nav";
import type { LeaseReviewResult } from "@/lib/db/schema";

type ReviewSummary = {
  totalIssues: number;
  redFlags: number;
  yellowFlags: number;
  blueFlags: number;
  overallAssessment: string;
};

type DocSegment = { type: "plain"; text: string } | { type: "highlight"; text: string; issueId: string; severity: "red" | "yellow" | "blue" };

// Build segments with exact character-range highlights (coordinated with suggestions)
function buildSegments(
  text: string,
  results: LeaseReviewResult[] | null
): DocSegment[] {
  if (!results?.length) return [{ type: "plain", text }];

  const severityOrder = { red: 0, yellow: 1, blue: 2 };
  type Range = { start: number; end: number; issueId: string; severity: "red" | "yellow" | "blue" };
  const ranges: Range[] = [];

  for (const issue of results) {
    if (!issue.problematicText || issue.status === "accepted") continue;
    const needle = issue.problematicText;
    let pos = 0;
    while (true) {
      const idx = text.indexOf(needle, pos);
      if (idx === -1) break;
      ranges.push({
        start: idx,
        end: idx + needle.length,
        issueId: issue.id,
        severity: issue.severity as "red" | "yellow" | "blue",
      });
      pos = idx + 1;
    }
  }

  // For each character, assign the covering issue with highest priority (red > yellow > blue)
  const len = text.length;
  const assign: (Range | null)[] = Array(len).fill(null);
  for (const r of ranges) {
    for (let i = r.start; i < r.end; i++) {
      const current = assign[i];
      if (!current || severityOrder[r.severity] < severityOrder[current.severity])
        assign[i] = r;
    }
  }

  const segments: DocSegment[] = [];
  let i = 0;
  while (i < len) {
    const r = assign[i];
    if (!r) {
      let j = i;
      while (j < len && !assign[j]) j++;
      segments.push({ type: "plain", text: text.slice(i, j) });
      i = j;
      continue;
    }
    let j = i;
    while (j < len && assign[j] === r) j++;
    segments.push({
      type: "highlight",
      text: text.slice(i, j),
      issueId: r.issueId,
      severity: r.severity,
    });
    i = j;
  }

  return segments.length ? segments : [{ type: "plain", text }];
}

// Build revised text by applying accepted replacements (for export)
function applyAcceptedChanges(
  text: string,
  results: LeaseReviewResult[]
): { revisedText: string; changelog: string[] } {
  let revised = text;
  const log: string[] = [];
  const accepted = results.filter((r) => r.status === "accepted" && r.problematicText);
  for (const issue of accepted) {
    const orig = issue.problematicText!;
    const replacement = issue.suggestedReplacement ?? "";
    if (revised.includes(orig)) {
      revised = revised.replace(orig, replacement);
      log.push(`[${issue.severity.toUpperCase()}] ${issue.title}\n  Removed/replaced: "${orig.slice(0, 60)}${orig.length > 60 ? "…" : ""}"\n  With: ${replacement ? `"${replacement.slice(0, 60)}${replacement.length > 60 ? "…" : ""}"` : "(removed)"}`);
    }
  }
  return { revisedText: revised, changelog: log };
}

function downloadRevisedLease(revisedText: string, changelog: string[], withChangelog: boolean) {
  const body = withChangelog
    ? revisedText + "\n\n--- CHANGELOG (RentWise AI suggestions applied) ---\n\n" + changelog.join("\n\n")
    : revisedText;
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lease-revised-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const MAX_UNDO = 50;

export default function PublicLeaseReviewPage() {
  const [leaseText, setLeaseText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [results, setResults] = useState<LeaseReviewResult[] | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [{ history, historyIndex }, setHistoryState] = useState<{ history: string[]; historyIndex: number }>({
    history: [],
    historyIndex: -1,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentPaneRef = useRef<HTMLDivElement>(null);
  const suggestionsPaneRef = useRef<HTMLDivElement>(null);
  const editDocRef = useRef<HTMLDivElement>(null);
  const initialEditContentRef = useRef<string>("");

  const pushHistory = useCallback((newState: string) => {
    setHistoryState((prev) => {
      const trimmed = prev.history.slice(0, prev.historyIndex + 1);
      const next = trimmed.length >= MAX_UNDO ? [...trimmed.slice(1), newState] : [...trimmed, newState];
      return { history: next, historyIndex: next.length - 1 };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const nextIndex = prev.historyIndex - 1;
      setLeaseText(prev.history[nextIndex]);
      return { ...prev, historyIndex: nextIndex };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIndex = prev.historyIndex + 1;
      setLeaseText(prev.history[nextIndex]);
      return { ...prev, historyIndex: nextIndex };
    });
  }, []);

  const startEdit = useCallback(() => {
    setEditDraft(leaseText);
    initialEditContentRef.current = leaseText;
    setIsEditMode(true);
  }, [leaseText]);

  const saveEdit = useCallback(() => {
    const text = editDocRef.current?.innerText ?? editDraft;
    pushHistory(text);
    setLeaseText(text);
    setIsEditMode(false);
  }, [editDraft, pushHistory]);

  const cancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtractError(null);
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/lease/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExtractError(data.error || "Failed to extract text from file.");
        return;
      }
      if (data.text && data.text.trim().length >= 10) {
        setLeaseText(data.text.trim());
        setExtractError(null);
      } else {
        setExtractError("Could not extract enough text. Try pasting the lease text directly.");
      }
    } catch {
      setExtractError("Upload failed. Please try again or paste the lease text below.");
    } finally {
      setIsExtracting(false);
      e.target.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!leaseText.trim() || leaseText.length < 100) return;
    setIsAnalyzing(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/lease/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseText, jurisdiction }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Analysis failed. Please try again.");
        return;
      }
      if (data.results) {
        setResults(data.results);
        setSummary(data.summary ?? null);
        setExpandedIds(new Set());
        setSelectedIssueId(null);
        setHistoryState({ history: [leaseText], historyIndex: 0 });
      }
    } catch {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = useCallback(
    (issueId: string, action: "accepted" | "rejected" | "flagged") => {
      if (action === "accepted") {
        const issue = results?.find((r) => r.id === issueId);
        if (issue?.problematicText != null) {
          const replacement = issue.suggestedReplacement ?? "";
          const nextText = leaseText.replace(issue.problematicText!, replacement);
          pushHistory(nextText);
          setLeaseText(nextText);
        }
      }
      setResults(
        (prev) =>
          prev?.map((r) => (r.id === issueId ? { ...r, status: action } : r)) ?? null
      );
    },
    [results, leaseText, pushHistory]
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const scrollToClause = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setExpandedIds((prev) => new Set([...prev, issueId]));
    document.getElementById(`clause-${issueId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToSuggestion = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setExpandedIds((prev) => new Set([...prev, issueId]));
    document.getElementById(`suggestion-${issueId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const segments = useMemo(() => buildSegments(leaseText, results), [leaseText, results]);
  const { changelog } = useMemo(
    () => applyAcceptedChanges(leaseText, results ?? []),
    [leaseText, results]
  );

  const severityMeta = {
    red: { icon: AlertTriangle, label: "Prohibited", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-200" },
    yellow: { icon: AlertCircle, label: "Risky", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-200" },
    blue: { icon: Info, label: "Missing", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-200" },
  };

  const resolvedCount = results?.filter((r) => r.status === "accepted").length ?? 0;
  const remainingCount = (results?.length ?? 0) - resolvedCount;
  const redRemaining = results?.filter((r) => r.severity === "red" && r.status !== "accepted").length ?? 0;
  const yellowRemaining = results?.filter((r) => r.severity === "yellow" && r.status !== "accepted").length ?? 0;
  const blueRemaining = results?.filter((r) => r.severity === "blue" && r.status !== "accepted").length ?? 0;

  const complianceStatusMessage =
    redRemaining > 0
      ? `${redRemaining} prohibited clause${redRemaining > 1 ? "s" : ""} remain — this lease should not be used as-is.`
      : yellowRemaining > 0
        ? `${yellowRemaining} risky item${yellowRemaining > 1 ? "s" : ""} remain — consider attorney review.`
        : blueRemaining > 0
          ? `${blueRemaining} missing disclosure${blueRemaining > 1 ? "s" : ""} — add before use.`
          : "No critical issues remaining. Have an attorney review before signing.";

  // Pre-analysis: upload + paste
  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <MainNav />

        <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">AI Lease Review</h1>
            <p className="mt-2 text-muted-foreground">
              Upload a PDF or Word lease, or paste text. RentWise AI flags prohibited clauses, risky language, and missing disclosures for DC, Maryland, and Prince George&apos;s County.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              One free review — <Link href="/sign-up" className="text-primary hover:underline">create an account</Link> for unlimited access.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload or paste your lease</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasAcknowledged ? (
                <AIPreAnalysisDisclaimer onAcknowledge={() => setHasAcknowledged(true)} />
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Jurisdiction</label>
                    <select
                      className="mt-1 flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-background"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                    >
                      <option value="dc">Washington D.C.</option>
                      <option value="maryland">Maryland</option>
                      <option value="pg_county">Prince George&apos;s County</option>
                    </select>
                  </div>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 transition-colors hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload lease (PDF or Word)</p>
                    <p className="text-xs text-muted-foreground">.pdf, .doc, .docx</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isExtracting}
                    />
                    {isExtracting && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Extracting text…
                      </p>
                    )}
                  </div>
                  {extractError && (
                    <p className="rounded-md bg-red-50 dark:bg-red-950/30 p-2 text-sm text-red-700 dark:text-red-300">{extractError}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or paste lease text</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Lease text</label>
                    <textarea
                      className="mt-1 min-h-[300px] w-full rounded-md border p-3 text-sm bg-background"
                      placeholder="Paste the full text of your lease here..."
                      value={leaseText}
                      onChange={(e) => setLeaseText(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{leaseText.length} characters (min 100)</p>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || leaseText.length < 100}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
                    ) : (
                      <>Analyze lease <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="border-t py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground">
              <Scale className="mr-1 inline h-3 w-3" />
              RentWise AI provides compliance guidance, not legal advice. Consult a licensed attorney for legal decisions.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const hasAccepted = resolvedCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <MainNav />

      {/* Compliance summary bar */}
      <div className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800 px-4 py-3 shrink-0">
        <div className="container mx-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="red">{summary?.redFlags ?? 0} Prohibited</Badge>
            <Badge variant="yellow">{summary?.yellowFlags ?? 0} Risky</Badge>
            <Badge variant="blue">{summary?.blueFlags ?? 0} Missing</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{resolvedCount}</span> resolved · <span className="font-medium text-foreground">{remainingCount}</span> remaining
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{complianceStatusMessage}</p>
          </div>
          <div className="flex gap-2">
            {hasAccepted && (
              <>
                <Button variant="outline" size="sm" onClick={() => downloadRevisedLease(leaseText, changelog, false)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export revised (TXT)
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadRevisedLease(leaseText, changelog, true)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export + changelog
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setResults(null); setSummary(null); setLeaseText(""); }}>
              New review
            </Button>
          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0 container mx-auto w-full max-w-[1600px] px-4 py-4 gap-4">
        {/* Left: document */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1 || history.length === 0}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            {!isEditMode ? (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit document
              </Button>
            ) : (
              <>
                <Button size="sm" onClick={saveEdit}>
                  <CheckIcon className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            )}
          </div>
          <div
            ref={documentPaneRef}
            className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm"
          >
            {isEditMode ? (
              <div
                ref={editDocRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full h-full min-h-[400px] p-6 text-sm font-serif focus:outline-none focus:ring-0 bg-white dark:bg-zinc-900 text-foreground leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {(() => {
                  const editSegments = buildSegments(initialEditContentRef.current, results);
                  const seenIds = new Set<string>();
                  return editSegments.map((seg, i) => {
                    if (seg.type === "plain") {
                      return <span key={i}>{seg.text}</span>;
                    }
                    const meta = severityMeta[seg.severity];
                    return (
                      <span
                        key={i}
                        className={`rounded px-0.5 -mx-0.5 border-b-2 ${meta.border} ${meta.bg} ${meta.text}`}
                      >
                        {seg.text}
                      </span>
                    );
                  });
                })()}
              </div>
            ) : (
              <div
                className="p-6 font-serif text-[15px] leading-relaxed whitespace-pre-wrap text-foreground selection:bg-primary/20"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {(() => {
                  const seenIds = new Set<string>();
                  return segments.map((seg, i) => {
                    if (seg.type === "plain") {
                      return <span key={i}>{seg.text}</span>;
                    }
                    const meta = severityMeta[seg.severity];
                    const isFirstForIssue = !seenIds.has(seg.issueId);
                    if (isFirstForIssue) seenIds.add(seg.issueId);
                    return (
                      <span
                        key={i}
                        id={isFirstForIssue ? `clause-${seg.issueId}` : undefined}
                        className={`cursor-pointer rounded px-0.5 -mx-0.5 border-b-2 ${meta.border} ${meta.bg} ${selectedIssueId === seg.issueId ? "ring-1 ring-primary ring-offset-1" : ""}`}
                        onClick={() => scrollToSuggestion(seg.issueId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && scrollToSuggestion(seg.issueId)}
                      >
                        {seg.text}
                      </span>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right: suggestions */}
        <div
          ref={suggestionsPaneRef}
          className="w-[400px] shrink-0 overflow-y-auto rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm flex flex-col"
        >
          <div className="p-4 border-b dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <h3 className="font-semibold">Suggestions ({results?.length ?? 0})</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{summary?.overallAssessment}</p>
          </div>
          <div className="divide-y dark:divide-zinc-800 flex-1">
            {results?.map((issue) => {
              const meta = severityMeta[issue.severity as keyof typeof severityMeta];
              const Icon = meta.icon;
              const isExpanded = expandedIds.has(issue.id);
              const isSelected = selectedIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  id={`suggestion-${issue.id}`}
                  className={`p-4 transition-colors ${isSelected ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      toggleExpanded(issue.id);
                      setSelectedIssueId(issue.id);
                      scrollToClause(issue.id);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${meta.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={issue.severity as "red" | "yellow" | "blue"}>
                            {meta.label}
                          </Badge>
                          {issue.status !== "pending" && (
                            <Badge variant={issue.status === "accepted" ? "green" : "secondary"}>
                              {issue.status}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.summary}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t dark:border-zinc-800 space-y-3">
                      {issue.problematicText && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Problematic language</p>
                          <p className="mt-1 rounded bg-red-50 dark:bg-red-950/30 p-2 text-xs italic">&ldquo;{issue.problematicText}&rdquo;</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Explanation</p>
                        <p className="mt-1 text-sm">{issue.explanation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Citation</p>
                        <p className="mt-1 text-xs font-mono text-primary">{issue.citedStatute}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Suggested action</p>
                        <p className="mt-1 text-sm">{issue.suggestedAction}</p>
                      </div>
                      {issue.suggestedReplacement && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Suggested replacement</p>
                          <p className="mt-1 rounded bg-green-50 dark:bg-green-950/30 p-2 text-xs">{issue.suggestedReplacement}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge level={issue.confidenceLevel} />
                      </div>
                      <PerSuggestionDisclaimer confidence={issue.confidenceLevel} />

                      {issue.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => handleAction(issue.id, "accepted")}>
                            <Check className="mr-1 h-3 w-3" /> Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(issue.id, "rejected")}>
                            <X className="mr-1 h-3 w-3" /> Reject
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleAction(issue.id, "flagged")}>
                            <Flag className="mr-1 h-3 w-3" /> Flag for attorney
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="border-t py-4 shrink-0">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            <Scale className="mr-1 inline h-3 w-3" />
            RentWise AI provides compliance guidance, not legal advice. Consult a licensed attorney for legal decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
