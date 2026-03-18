"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
  FileSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
  Shield,
  Lock,
  Crown,
  HelpCircle,
  Clock,
  Zap,
  Calendar,
} from "lucide-react";
import {
  AIPreAnalysisDisclaimer,
  ConfidenceBadge,
  PerSuggestionDisclaimer,
} from "@/components/ai-disclaimer-bar";
import { AccessGate } from "@/components/access-gate";
import {
  canUserReview,
  incrementAnonReviewCount,
  hasAnonReviewsRemaining,
  type RentWiseUser,
} from "@/lib/usage";
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
  const { user, isSignedIn } = useUser();
  const [leaseText, setLeaseText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [gateReason, setGateReason] = useState<"anonymous_limit" | "monthly_limit" | "plan_required" | "auth_required">("anonymous_limit");
  const [flashId, setFlashId] = useState<string | null>(null);

  // Flash an element briefly for cross-reference linking
  const flashElement = useCallback((id: string) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1500);
  }, []);

  const getRentWiseUser = (): RentWiseUser => {
    if (!isSignedIn || !user) return null;
    return {
      id: user.id,
      role: (user.publicMetadata?.role as "tenant" | "landlord" | "pm") || "landlord",
      plan: (user.publicMetadata?.plan as "free" | "pro" | "pm") || "free",
    };
  };
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

    // Access check before running analysis
    const rwUser = getRentWiseUser();
    const access = await canUserReview(rwUser);
    if (!access.allowed) {
      setGateReason(access.reason!);
      setShowGate(true);
      return;
    }

    // If anonymous, increment the localStorage counter before analysis
    if (!isSignedIn) {
      incrementAnonReviewCount();
    }

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
    const el = document.getElementById(`clause-${issueId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    flashElement(issueId);
  }, [flashElement]);

  const scrollToSuggestion = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setExpandedIds((prev) => new Set([...prev, issueId]));
    const el = document.getElementById(`suggestion-${issueId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    flashElement(issueId);
  }, [flashElement]);

  const segments = useMemo(() => buildSegments(leaseText, results), [leaseText, results]);
  const { changelog } = useMemo(
    () => applyAcceptedChanges(leaseText, results ?? []),
    [leaseText, results]
  );

  const [filter, setFilter] = useState<"all" | "prohibited" | "risky" | "missing" | "resolved">("all");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const severityMeta = {
    red: { icon: AlertTriangle, label: "Prohibited", bg: "bg-red-100/80", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-200", highlightBorder: "border-b-2 border-red-400", hoverBg: "hover:bg-red-200/90", badgeBg: "bg-red-500", badgeLight: "bg-red-100 text-red-600 border-red-200", cardBorder: "border-red-200 border-l-[3px] border-l-red-400" },
    yellow: { icon: AlertCircle, label: "Risky", bg: "bg-amber-100/80", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-200", highlightBorder: "border-b-2 border-amber-400", hoverBg: "hover:bg-amber-200/90", badgeBg: "bg-amber-500", badgeLight: "bg-amber-100 text-amber-600 border-amber-200", cardBorder: "border-amber-200 border-l-[3px] border-l-amber-400" },
    blue: { icon: Info, label: "Missing", bg: "bg-orange-50/50", border: "border-orange-200 dark:border-orange-800", text: "text-orange-800 dark:text-orange-200", highlightBorder: "border-b-2 border-orange-300", hoverBg: "hover:bg-orange-100/90", badgeBg: "bg-orange-500", badgeLight: "bg-orange-100 text-orange-600 border-orange-200", cardBorder: "border-orange-200 border-l-[3px] border-l-orange-400" },
  };

  // Build issue index for numbered badges
  const issueIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    results?.forEach((r, i) => map.set(r.id, i + 1));
    return map;
  }, [results]);

  const resolvedCount = results?.filter((r) => r.status === "accepted").length ?? 0;
  const remainingCount = (results?.length ?? 0) - resolvedCount;

  // Filter counts
  const prohibitedCount = results?.filter((r) => r.severity === "red" && r.status === "pending").length ?? 0;
  const riskyCount = results?.filter((r) => r.severity === "yellow" && r.status === "pending").length ?? 0;
  const missingCount = results?.filter((r) => r.severity === "blue" && r.status === "pending").length ?? 0;
  const resolvedFilterCount = results?.filter((r) => r.status !== "pending").length ?? 0;

  const filteredResults = useMemo(() => {
    if (!results) return [];
    return results.filter((s) => {
      if (filter === "all") return true;
      if (filter === "resolved") return s.status !== "pending";
      if (filter === "prohibited") return s.severity === "red" && s.status === "pending";
      if (filter === "risky") return s.severity === "yellow" && s.status === "pending";
      if (filter === "missing") return s.severity === "blue" && s.status === "pending";
      return true;
    });
  }, [results, filter]);

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

        {/* Dark header — matches lease review results page */}
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d4a6f] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="relative max-w-3xl mx-auto px-6 py-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm font-medium mb-5">
              <FileSearch className="w-3.5 h-3.5 text-blue-300" />
              AI-Powered Analysis
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              AI Lease Review
            </h1>
            <p className="text-blue-200 text-base mt-3 max-w-lg mx-auto leading-relaxed">
              Upload a PDF or Word lease, or paste text. RentWise flags prohibited clauses, risky language, and missing disclosures for DC, Maryland, and Prince George&apos;s County.
            </p>
            <p className="text-blue-300/60 text-sm mt-3">
              One free review — <Link href="/sign-up" className="text-blue-300 hover:text-white underline underline-offset-2 transition-colors">create an account</Link> for unlimited access.
            </p>
          </div>
        </div>

        {/* Upload area — overlaps header */}
        <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10 pb-20">

          {/* Usage indicator — shows remaining reviews */}
          {!isSignedIn && hasAnonReviewsRemaining() && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-4">
              <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-700">
                <span className="font-semibold">1 free review</span> available — no account needed
              </span>
            </div>
          )}

          {!isSignedIn && !hasAnonReviewsRemaining() && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4">
              <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-amber-700">
                Free review used — <Link href="/sign-up" className="font-semibold underline">create an account</Link> to continue
              </span>
            </div>
          )}

          {isSignedIn && user?.publicMetadata?.role === "tenant" && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-emerald-700">
                <span className="font-semibold">Unlimited reviews</span> — free for tenants
              </span>
            </div>
          )}

          {isSignedIn && user?.publicMetadata?.role === "landlord" && user?.publicMetadata?.plan === "free" && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 mb-4">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <FileSearch className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-semibold">2 reviews/month</span> on Free plan
              </span>
              <Link href="/pricing" className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                Upgrade for unlimited →
              </Link>
            </div>
          )}

          {isSignedIn && (user?.publicMetadata?.plan === "pro" || user?.publicMetadata?.plan === "pm") && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 mb-4">
              <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-slate-600">
                <span className="font-semibold">Unlimited reviews</span> — {user?.publicMetadata?.plan === "pro" ? "Pro" : "Property Manager"} plan
              </span>
            </div>
          )}

          {/* Main upload card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden">

            {/* Disclaimer gate — shown before upload form */}
            {!hasAcknowledged ? (
              <div className="p-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-900">AI Analysis Disclaimer</h4>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      This analysis is powered by AI and is for <span className="font-semibold text-slate-700">informational purposes only</span>. It does not constitute legal advice from a licensed attorney. Results should be verified by a qualified legal professional.
                    </p>
                    <button
                      onClick={() => setHasAcknowledged(true)}
                      className="mt-4 inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                    >
                      I Understand — Proceed
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Upload section */}
                <div className="p-8">
                  <h2 className="text-base font-bold text-slate-900">Upload or paste your lease</h2>
                  <p className="text-sm text-slate-500 mt-1">Supports PDF, Word (.docx), and plain text</p>

                  {/* Jurisdiction selector */}
                  <div className="mt-5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Jurisdiction</label>
                    <select
                      className="mt-1.5 flex h-10 w-full rounded-xl border border-slate-200 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                    >
                      <option value="dc">Washington D.C.</option>
                      <option value="maryland">Maryland</option>
                      <option value="pg_county">Prince George&apos;s County</option>
                    </select>
                  </div>

                  {/* Drop zone — PRESERVES existing file upload handler */}
                  <div
                    className="mt-5 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mx-auto transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-4">Drop your lease here, or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1.5">PDF, DOCX, or TXT · Max 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isExtracting}
                    />
                    {isExtracting && (
                      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-blue-600">
                        <Loader2 className="h-3 w-3 animate-spin" /> Extracting text…
                      </p>
                    )}
                  </div>

                  {extractError && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-100">{extractError}</p>
                  )}

                  {/* Or divider */}
                  <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or paste text</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Text paste area — PRESERVES existing textarea handler */}
                  <textarea
                    className="w-full h-32 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                    placeholder="Paste your lease text here..."
                    value={leaseText}
                    onChange={(e) => setLeaseText(e.target.value)}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">{leaseText.length} characters (min 100)</p>
                </div>

                {/* Disclaimer + Privacy — compact, inside the card */}
                <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 space-y-3">
                  {/* AI Disclaimer */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">AI Analysis Disclaimer</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        This analysis is for <span className="font-semibold text-slate-600">informational purposes only</span>. It does not constitute legal advice and does not create an attorney-client relationship. Verify results with a qualified legal professional.
                      </p>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">Your privacy matters</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Documents are processed securely and encrypted in transit. Not shared with third parties. Delete anytime from account settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button — PRESERVES existing click handler */}
                <div className="px-8 py-5 bg-white border-t border-slate-100">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || leaseText.length < 100}
                    className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.99] shadow-lg shadow-[#1e3a5f]/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analyze My Lease</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* What to expect — below the card */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2.5">Prohibited Clauses</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Illegal waivers, self-help eviction terms, excessive fees</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2.5">Missing Disclosures</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Lead paint, mold, flood zone, and other required notices</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2.5">Suggested Fixes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Compliant replacement language with legal citations</p>
            </div>
          </div>
        </div>

        {/* Access gate modal */}
        {showGate && (
          <AccessGate
            reason={gateReason}
            feature="Lease Review"
            onClose={() => setShowGate(false)}
          />
        )}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{resolvedCount}</span> resolved · <span className="font-medium text-foreground">{remainingCount}</span> remaining
            </span>
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${results?.length ? (resolvedCount / results.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            <Clock className="w-3 h-3" />
            ~2.5 hrs saved
          </span>
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
                className="px-10 py-8 font-serif text-[15px] leading-[1.8] whitespace-pre-wrap text-foreground selection:bg-primary/20 max-w-[700px] mx-auto"
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
                    const issueNum = issueIndexMap.get(seg.issueId) ?? 0;
                    const issue = results?.find((r) => r.id === seg.issueId);
                    const isMuted = issue?.status === "rejected";
                    return (
                      <span
                        key={i}
                        id={isFirstForIssue ? `clause-${seg.issueId}` : undefined}
                        data-suggestion-id={seg.issueId}
                        className={`cursor-pointer rounded-sm px-0.5 -mx-0.5 ${meta.highlightBorder} ${isMuted ? "bg-slate-100/50 opacity-50" : meta.bg} ${meta.hoverBg} transition-all ${
                          flashId === seg.issueId ? "ring-2 ring-blue-400 ring-offset-1" : selectedIssueId === seg.issueId ? "ring-1 ring-primary ring-offset-1" : ""
                        }`}
                        onClick={() => scrollToSuggestion(seg.issueId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && scrollToSuggestion(seg.issueId)}
                      >
                        {isFirstForIssue && (
                          <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full ${meta.badgeBg} text-white text-[9px] font-bold mr-1 align-middle flex-shrink-0 hover:scale-110 transition-transform`}>
                            {issueNum}
                          </span>
                        )}
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
          className="w-[420px] shrink-0 rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm flex flex-col h-full"
        >
          {/* FIXED ZONE — always visible */}
          <div className="flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Suggestions</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-600 flex items-center justify-center">
                  {results?.length ?? 0}
                </span>
              </div>
              <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors" title="↑↓ navigate, Enter expand, A accept, I ignore">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto">
              {([
                { key: "all" as const, label: `All (${results?.length ?? 0})`, activeBg: "bg-slate-900 text-white" },
                { key: "prohibited" as const, label: `Prohibited (${prohibitedCount})`, activeBg: "bg-red-600 text-white" },
                { key: "risky" as const, label: `Risky (${riskyCount})`, activeBg: "bg-amber-500 text-white" },
                { key: "missing" as const, label: `Missing (${missingCount})`, activeBg: "bg-orange-500 text-white" },
                { key: "resolved" as const, label: `Resolved (${resolvedFilterCount})`, activeBg: "bg-emerald-600 text-white" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filter === f.key ? f.activeBg : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* SCROLLABLE ZONE */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
            {/* AI Summary — compact */}
            {summary?.overallAssessment && (
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 mb-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">AI Summary</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Mar 2026
                  </span>
                </div>
                <p className={`text-xs text-slate-600 mt-1.5 leading-relaxed ${summaryExpanded ? "" : "line-clamp-2"}`}>
                  {summary.overallAssessment}
                </p>
                {summary.overallAssessment.length > 120 && (
                  <button
                    onClick={() => setSummaryExpanded(!summaryExpanded)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    {summaryExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* Suggestion cards */}
            {filteredResults.map((issue) => {
              const meta = severityMeta[issue.severity as keyof typeof severityMeta];
              const Icon = meta.icon;
              const isExpanded = expandedIds.has(issue.id);
              const isSelected = selectedIssueId === issue.id;
              const issueNum = issueIndexMap.get(issue.id) ?? 0;
              const isAccepted = issue.status === "accepted";
              const isRejected = issue.status === "rejected";
              const isFlagged = issue.status === "flagged";
              const isResolved = isAccepted || isRejected || isFlagged;

              return (
                <div
                  key={issue.id}
                  id={`suggestion-${issue.id}`}
                  data-suggestion-id={issue.id}
                  className={`bg-white rounded-lg border overflow-hidden transition-all ${
                    isResolved && !isExpanded ? "opacity-60" : ""
                  } ${isExpanded ? "border-slate-300 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"} ${
                    flashId === issue.id ? "ring-2 ring-blue-400 ring-offset-1" : isSelected ? "ring-1 ring-primary/30" : ""
                  }`}
                >
                  {/* Collapsed header */}
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 cursor-pointer group"
                    onClick={() => {
                      toggleExpanded(issue.id);
                      setSelectedIssueId(issue.id);
                      scrollToClause(issue.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 border ${meta.badgeLight}`}>
                        {issueNum}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${meta.badgeLight}`}>
                        {meta.label}
                      </span>
                      {/* Confidence indicator */}
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        issue.confidenceLevel === "high"
                          ? "text-emerald-600 bg-emerald-50"
                          : issue.confidenceLevel === "medium"
                            ? "text-amber-600 bg-amber-50"
                            : "text-slate-500 bg-slate-100"
                      }`}>
                        {issue.confidenceLevel === "high" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {issue.confidenceLevel === "high" ? "High" : issue.confidenceLevel === "medium" ? "Review" : "Verify"}
                      </span>
                      {isAccepted && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Accepted ✓</span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">Ignored</span>
                      )}
                      {isFlagged && (
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full border border-violet-200">Flagged</span>
                      )}
                      <span className={`text-xs font-semibold truncate flex-1 ${isRejected ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {issue.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:text-slate-600" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-slate-100">
                      {/* Flagged text */}
                      {issue.problematicText && (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flagged text</p>
                          <div className="mt-1.5 bg-red-50 border-l-[3px] border-red-400 rounded-r-lg p-3.5">
                            <p className="text-sm text-red-900 leading-relaxed line-through decoration-red-300 decoration-2">
                              {issue.problematicText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Explanation</p>
                        <p className="mt-1 text-sm text-slate-700 leading-relaxed">{issue.explanation}</p>
                      </div>

                      {/* Suggested replacement */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested replacement</p>
                        <div className="mt-1.5 bg-emerald-50 border-l-[3px] border-emerald-500 rounded-r-lg p-3.5">
                          <p className="text-sm text-emerald-900 leading-relaxed">
                            {issue.suggestedReplacement || issue.suggestedAction || "Consult with a licensed attorney for appropriate replacement language."}
                          </p>
                        </div>
                      </div>

                      {/* Legal citation */}
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Legal basis</p>
                        <div className="mt-1.5 flex items-start gap-2.5 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <Scale className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{issue.citedStatute}</p>
                          </div>
                        </div>
                      </div>

                      <PerSuggestionDisclaimer confidence={issue.confidenceLevel} />

                      {/* Action buttons */}
                      {issue.status === "pending" && (
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => handleAction(issue.id, "accepted")}
                            className="flex items-center gap-1.5 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept Change
                          </button>
                          <button
                            onClick={() => handleAction(issue.id, "rejected")}
                            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => handleAction(issue.id, "flagged")}
                            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-violet-50 text-slate-500 text-xs font-medium px-3 py-2 rounded-lg transition-all"
                          >
                            <Flag className="w-3 h-3" />
                            Flag
                          </button>
                          <button
                            onClick={() => {
                              startEdit();
                              setTimeout(() => {
                                document.getElementById(`clause-${issue.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                              }, 100);
                            }}
                            className="ml-auto text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                          >
                            Edit manually
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <button
                          onClick={() => setResults((prev) => prev?.map((r) => (r.id === issue.id ? { ...r, status: "pending" } : r)) ?? null)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ignored — click to review again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No suggestions match this filter</p>
              </div>
            )}

            {/* Limitations section */}
            <details className="mt-4 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  What this review may miss
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </summary>
              <div className="px-4 pb-4 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
                <p>This AI analysis has known limitations:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Cannot detect issues requiring context beyond the lease text</li>
                  <li>Unusual or novel lease structures may not be fully analyzed</li>
                  <li>Local amendments after February 2026 are not reflected</li>
                  <li>Does not evaluate whether dollar amounts are market-reasonable</li>
                  <li>Cannot verify factual claims (e.g., whether property is licensed)</li>
                </ul>
                <p className="font-medium text-slate-600 mt-2">Always have a licensed attorney review your lease before execution.</p>
              </div>
            </details>
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
