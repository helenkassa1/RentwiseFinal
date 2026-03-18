"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, ArrowRight, ArrowLeft, Scale, AlertTriangle, AlertCircle, Info, Upload, Check, X, Download,
  ChevronDown, ChevronUp, Undo2, Redo2, Pencil, Check as CheckIcon, Eye, XCircle, CheckCircle2,
  Minus, Plus, Keyboard, PanelRightClose, PanelRightOpen, Shield, Clock, Calendar, ExternalLink,
  UserCheck, Zap, FileSearch, RotateCcw,
} from "lucide-react";
import {
  AIPreAnalysisDisclaimer, ConfidenceBadge, PerSuggestionDisclaimer, HumanReviewIndicator, AppFooterDisclaimer,
} from "@/components/ai-disclaimer-bar";
import { MainNav } from "@/components/navigation/main-nav";
import { findCitationByCode } from "@/lib/legal-citations";
import type { LeaseReviewResult } from "@/lib/db/schema";

/* ── types ─────────────────────────────────────────────────────────────── */
type ReviewSummary = { totalIssues: number; redFlags: number; yellowFlags: number; blueFlags: number; overallAssessment: string };
type DocSegment = { type: "plain"; text: string } | { type: "highlight"; text: string; issueId: string; severity: "red" | "yellow" | "blue" };
type SuggestionFilter = "all" | "red" | "yellow" | "blue" | "resolved";

/* ── helpers ───────────────────────────────────────────────────────────── */
function buildSegments(text: string, results: LeaseReviewResult[] | null): DocSegment[] {
  if (!results?.length) return [{ type: "plain", text }];
  const so = { red: 0, yellow: 1, blue: 2 };
  type Range = { start: number; end: number; issueId: string; severity: "red" | "yellow" | "blue" };
  const ranges: Range[] = [];
  for (const issue of results) {
    if (!issue.problematicText || issue.status === "accepted") continue;
    const needle = issue.problematicText; let pos = 0;
    while (true) { const idx = text.indexOf(needle, pos); if (idx === -1) break; ranges.push({ start: idx, end: idx + needle.length, issueId: issue.id, severity: issue.severity as "red"|"yellow"|"blue" }); pos = idx + 1; }
  }
  const len = text.length; const assign: (Range | null)[] = Array(len).fill(null);
  for (const r of ranges) for (let i = r.start; i < r.end; i++) { const c = assign[i]; if (!c || so[r.severity] < so[c.severity]) assign[i] = r; }
  const segs: DocSegment[] = []; let i = 0;
  while (i < len) { const r = assign[i]; if (!r) { let j = i; while (j < len && !assign[j]) j++; segs.push({ type: "plain", text: text.slice(i, j) }); i = j; continue; } let j = i; while (j < len && assign[j] === r) j++; segs.push({ type: "highlight", text: text.slice(i, j), issueId: r.issueId, severity: r.severity }); i = j; }
  return segs.length ? segs : [{ type: "plain", text }];
}

function applyAcceptedChanges(text: string, results: LeaseReviewResult[]): { revisedText: string; changelog: string[] } {
  let revised = text; const log: string[] = [];
  for (const issue of results.filter((r) => r.status === "accepted" && r.problematicText)) {
    const orig = issue.problematicText!; const repl = issue.suggestedReplacement ?? "";
    if (revised.includes(orig)) { revised = revised.replace(orig, repl); log.push(`[${issue.severity.toUpperCase()}] ${issue.title}\n  Removed: "${orig.slice(0, 80)}${orig.length > 80 ? "\u2026" : ""}"\n  With: ${repl ? `"${repl.slice(0, 80)}${repl.length > 80 ? "\u2026" : ""}"` : "(removed)"}\n  Citation: ${issue.citedStatute}`); }
  }
  return { revisedText: revised, changelog: log };
}

function dl(content: string, filename: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function genReport(results: LeaseReviewResult[], summary: ReviewSummary | null, jur: string, at: Date | null): string {
  const d = at?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) ?? new Date().toLocaleDateString();
  const jn = JUR[jur] ?? jur; let r = `RENTWISE AI \u2014 LEASE COMPLIANCE REPORT\n${"=".repeat(50)}\n\nJurisdiction: ${jn}\nDate: ${d}\n\nSTATUS: ${summary?.totalIssues ?? 0} issues\n  Prohibited: ${summary?.redFlags ?? 0}\n  Risky: ${summary?.yellowFlags ?? 0}\n  Missing: ${summary?.blueFlags ?? 0}\n\n${"=".repeat(50)}\nFINDINGS\n${"=".repeat(50)}\n\n`;
  results.forEach((i, idx) => { r += `#${idx + 1} [${i.severity.toUpperCase()}] ${i.title}\nStatus: ${i.status === "accepted" ? "RESOLVED" : i.status === "rejected" ? "IGNORED" : "PENDING"}\n${i.problematicText ? `Text: "${i.problematicText}"\n` : ""}Explanation: ${i.explanation}\nCitation: ${i.citedStatute}\n${i.suggestedReplacement ? `Fix: ${i.suggestedReplacement}\n` : ""}Confidence: ${i.confidenceLevel}\n\n`; });
  r += `${"=".repeat(50)}\nDISCLAIMER: Generated by RentWise AI \u2014 Not legal advice.\n`; return r;
}

function genRedline(text: string, results: LeaseReviewResult[]): string {
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redlined Lease</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#334155}.rm{background:#fee2e2;color:#991b1b;text-decoration:line-through;text-decoration-color:#f87171;padding:2px 4px;border-radius:2px}.add{background:#d1fae5;color:#065f46;padding:2px 4px;border-radius:2px;font-weight:500}.cite{font-size:11px;color:#64748b;font-style:italic;margin-left:8px}h1{font-size:18px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:8px}.ft{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}</style></head><body><h1>RentWise AI \u2014 Redlined Lease</h1><p style="font-size:12px;color:#64748b">Generated ${new Date().toLocaleDateString()}</p>\n`;
  let t = text;
  for (const i of results.filter((r) => r.status === "accepted" && r.problematicText)) { const o = i.problematicText!; const rp = i.suggestedReplacement ?? ""; t = t.replace(o, `<span class="rm">${esc(o)}</span>${rp ? ` <span class="add">${esc(rp)}</span>` : ""}<span class="cite">[${esc(i.citedStatute)}]</span>`); }
  for (const i of results.filter((r) => r.status === "pending" && r.problematicText)) { const o = i.problematicText!; if (!t.includes(o)) continue; t = t.replace(o, `<span style="background:#fef3c7;border-bottom:2px solid #f59e0b;padding:2px 4px;border-radius:2px">${esc(o)}</span><span class="cite">\u26a0 ${esc(i.title)} [${esc(i.citedStatute)}]</span>`); }
  html += `<div style="white-space:pre-wrap">${t}</div><div class="ft">Generated by RentWise AI \u2014 Not legal advice.</div></body></html>`; return html;
}

const MAX_UNDO = 50;
const JUR: Record<string, string> = { dc: "Washington D.C.", maryland: "Maryland", pg_county: "Prince George\u2019s County" };

/* ══════════════════════════════════════════════════════════════════════ */
export default function PublicLeaseReviewPage() {
  const [leaseText, setLeaseText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ message: string; percent: number }>({ message: "", percent: 0 });
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [results, setResults] = useState<LeaseReviewResult[] | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [pendingReplace, setPendingReplace] = useState<{ issueId: string; original: string; replacement: string } | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SuggestionFilter>("all");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTimeSaved, setShowTimeSaved] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [analysisTime, setAnalysisTime] = useState<Date | null>(null);
  const [analysisDuration, setAnalysisDuration] = useState<number | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [dismissedJurisdiction, setDismissedJurisdiction] = useState(false);
  const [dismissedFairHousing, setDismissedFairHousing] = useState(false);
  const [{ history, historyIndex }, setHistoryState] = useState<{ history: string[]; historyIndex: number }>({ history: [], historyIndex: -1 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentPaneRef = useRef<HTMLDivElement>(null);
  const editDocRef = useRef<HTMLDivElement>(null);
  const initialEditContentRef = useRef<string>("");
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const timeSavedRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  // History
  const pushHistory = useCallback((ns: string) => { setHistoryState((p) => { const t = p.history.slice(0, p.historyIndex + 1); const n = t.length >= MAX_UNDO ? [...t.slice(1), ns] : [...t, ns]; return { history: n, historyIndex: n.length - 1 }; }); }, []);
  const handleUndo = useCallback(() => { setHistoryState((p) => { if (p.historyIndex <= 0) return p; const ni = p.historyIndex - 1; setLeaseText(p.history[ni]); return { ...p, historyIndex: ni }; }); }, []);
  const handleRedo = useCallback(() => { setHistoryState((p) => { if (p.historyIndex >= p.history.length - 1) return p; const ni = p.historyIndex + 1; setLeaseText(p.history[ni]); return { ...p, historyIndex: ni }; }); }, []);

  // Edit
  const startEdit = useCallback(() => { setEditDraft(leaseText); initialEditContentRef.current = leaseText; setIsEditMode(true); }, [leaseText]);
  const saveEdit = useCallback(() => { const t = editDocRef.current?.innerText ?? editDraft; pushHistory(t); setLeaseText(t); setIsEditMode(false); }, [editDraft, pushHistory]);
  const cancelEdit = useCallback(() => setIsEditMode(false), []);

  // Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setExtractError(null); setIsExtracting(true);
    try { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/lease/extract-text", { method: "POST", body: fd }); const data = await res.json().catch(() => ({})); if (!res.ok) { setExtractError(data.error || "Failed."); return; } if (data.text?.trim().length >= 10) { setLeaseText(data.text.trim()); setExtractError(null); } else setExtractError("Not enough text. Paste directly."); } catch { setExtractError("Upload failed."); } finally { setIsExtracting(false); e.target.value = ""; }
  };

  // Analyze — streaming for faster perceived speed
  const handleAnalyze = async () => {
    if (!leaseText.trim() || leaseText.length < 100) return;
    setIsAnalyzing(true); setExtractError(null); setAnalysisProgress({ message: "Starting analysis...", percent: 5 });
    const t0 = Date.now();
    try {
      const res = await fetch("/api/lease/review-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseText, jurisdiction }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Analysis failed."); return;
      }
      const reader = res.body?.getReader();
      if (!reader) { alert("Streaming not supported."); return; }
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Process complete JSON lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === "progress") {
              setAnalysisProgress({ message: msg.message ?? "Analyzing...", percent: msg.percent ?? 50 });
            } else if (msg.type === "complete") {
              setResults(msg.results);
              setSummary(msg.summary ?? null);
              setExpandedIds(new Set());
              setSelectedIssueId(null);
              setHistoryState({ history: [leaseText], historyIndex: 0 });
              setAnalysisTime(new Date());
              setAnalysisDuration(Math.round((Date.now() - t0) / 1000));
              setDismissedJurisdiction(false);
              setDismissedFairHousing(false);
            } else if (msg.type === "error") {
              alert(msg.error || "Analysis failed.");
            }
          } catch { /* skip malformed line */ }
        }
      }
    } catch { alert("Analysis failed."); } finally { setIsAnalyzing(false); setAnalysisProgress({ message: "", percent: 0 }); }
  };

  // Replace preview
  const previewReplace = useCallback((id: string) => { const i = results?.find((r) => r.id === id); if (!i?.problematicText) return; setPendingReplace({ issueId: id, original: i.problematicText, replacement: i.suggestedReplacement ?? "" }); setSelectedIssueId(id); setExpandedIds((p) => new Set([...p, id])); setTimeout(() => { document.getElementById(`clause-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50); }, [results]);
  const confirmReplace = useCallback(() => { if (!pendingReplace) return; const { issueId, original, replacement } = pendingReplace; const nt = leaseText.replace(original, replacement); pushHistory(nt); setLeaseText(nt); setResults((p) => p?.map((r) => (r.id === issueId ? { ...r, status: "accepted" } : r)) ?? null); setPendingReplace(null); }, [pendingReplace, leaseText, pushHistory]);
  const cancelReplace = useCallback(() => setPendingReplace(null), []);

  // Actions
  const handleAction = useCallback((id: string, action: "accepted" | "rejected" | "flagged") => {
    if (action === "accepted") {
      const i = results?.find((r) => r.id === id);
      // Missing clause (no problematicText) — append suggested text to end of document
      if (i && !i.problematicText && i.suggestedReplacement) {
        const nt = leaseText.trimEnd() + "\n\n" + i.suggestedReplacement;
        pushHistory(nt); setLeaseText(nt);
      }
      // Has problematic text + replacement — show inline diff preview
      else if (i?.problematicText && i.suggestedReplacement) { previewReplace(id); return; }
      // Has problematic text but no replacement — just remove
      else if (i?.problematicText != null) { const nt = leaseText.replace(i.problematicText!, i.suggestedReplacement ?? ""); pushHistory(nt); setLeaseText(nt); }
    }
    setResults((p) => p?.map((r) => (r.id === id ? { ...r, status: action } : r)) ?? null);
  }, [results, leaseText, pushHistory, previewReplace]);

  // Undo a single suggestion (revert to pending + undo text change)
  const undoAction = useCallback((id: string) => {
    // Revert the text change via undo history
    if (historyIndex > 0) {
      setHistoryState((p) => {
        const ni = p.historyIndex - 1;
        setLeaseText(p.history[ni]);
        return { ...p, historyIndex: ni };
      });
    }
    // Reset the suggestion status back to pending
    setResults((p) => p?.map((r) => (r.id === id ? { ...r, status: "pending" } : r)) ?? null);
  }, [historyIndex]);

  const toggleExpanded = useCallback((id: string) => { setExpandedIds((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);

  // Scrolling
  const scrollToClause = useCallback((id: string) => { setSelectedIssueId(id); setExpandedIds((p) => new Set([...p, id])); setPulseId(id); if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current); pulseTimerRef.current = setTimeout(() => setPulseId(null), 1800); document.getElementById(`clause-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, []);
  const scrollToSuggestion = useCallback((id: string) => { setSelectedIssueId(id); setExpandedIds((p) => new Set([...p, id])); setPanelOpen(true); setTimeout(() => { document.getElementById(`suggestion-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50); }, []);

  // Keyboard
  useEffect(() => {
    if (!results) return;
    const h = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return; const pend = results.filter((r) => r.status === "pending"); const ci = pend.findIndex((r) => r.id === selectedIssueId);
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); const n = pend[ci + 1] ?? pend[0]; if (n) { scrollToClause(n.id); scrollToSuggestion(n.id); } }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); const p = pend[ci - 1] ?? pend[pend.length - 1]; if (p) { scrollToClause(p.id); scrollToSuggestion(p.id); } }
      else if (e.key === "Enter" && selectedIssueId) { e.preventDefault(); toggleExpanded(selectedIssueId); }
      else if (e.key === "a" && selectedIssueId) { e.preventDefault(); handleAction(selectedIssueId, "accepted"); }
      else if (e.key === "i" && selectedIssueId) { e.preventDefault(); handleAction(selectedIssueId, "rejected"); }
    }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [results, selectedIssueId, scrollToClause, scrollToSuggestion, toggleExpanded, handleAction]);

  useEffect(() => { const h = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExportMenu(false); if (timeSavedRef.current && !timeSavedRef.current.contains(e.target as Node)) setShowTimeSaved(false); if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) setShowShortcuts(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  // Derived
  const segments = useMemo(() => buildSegments(leaseText, results), [leaseText, results]);
  const { changelog } = useMemo(() => applyAcceptedChanges(leaseText, results ?? []), [leaseText, results]);

  const totalCount = results?.length ?? 0;
  const resolvedCount = results?.filter((r) => r.status === "accepted").length ?? 0;
  const ignoredCount = results?.filter((r) => r.status === "rejected").length ?? 0;
  const redCount = results?.filter((r) => r.severity === "red" && r.status === "pending").length ?? 0;
  const yellowCount = results?.filter((r) => r.severity === "yellow" && r.status === "pending").length ?? 0;
  const blueCount = results?.filter((r) => r.severity === "blue" && r.status === "pending").length ?? 0;
  const pendingCount = totalCount - resolvedCount - ignoredCount;
  const progressPct = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  const hasCritical = redCount > 0;
  const hasFH = results?.some((r) => (r as any).isFairHousingFlag && r.status === "pending") ?? false;
  const hasJM = results?.some((r) => (r as any).isJurisdictionMismatch && r.status === "pending") ?? false;

  // Build issue number map (1-indexed, ordered as they appear in results)
  const issueNumMap = useMemo(() => { const m = new Map<string, number>(); results?.forEach((r, i) => m.set(r.id, i + 1)); return m; }, [results]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    switch (filter) {
      case "red": return results.filter((r) => r.severity === "red" && r.status === "pending");
      case "yellow": return results.filter((r) => r.severity === "yellow" && r.status === "pending");
      case "blue": return results.filter((r) => r.severity === "blue" && r.status === "pending");
      case "resolved": return results.filter((r) => r.status === "accepted" || r.status === "rejected");
      default: return results.filter((r) => r.status === "pending" || r.status === "flagged");
    }
  }, [results, filter]);

  // ═══════════════════ PRE-ANALYSIS ═══════════════════
  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <MainNav />
        <div className="flex-1 container mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">AI Lease Review</h1>
            <p className="mt-2 text-slate-500">Upload a PDF or Word lease, or paste text. RentWise AI flags prohibited clauses, risky language, and missing disclosures for DC, Maryland, and Prince George&apos;s County.</p>
            <p className="mt-1 text-sm text-slate-400">One free review &mdash; <Link href="/sign-up" className="text-blue-600 hover:underline">create an account</Link> for unlimited access.</p>
          </div>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-slate-900">Upload or paste your lease</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!hasAcknowledged ? <AIPreAnalysisDisclaimer onAcknowledge={() => setHasAcknowledged(true)} /> : (
                <>
                  <div><label className="text-sm font-medium text-slate-700">Jurisdiction</label><select className="mt-1 flex h-9 w-full rounded-lg border border-slate-200 px-3 py-1 text-sm bg-white text-slate-900" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}><option value="dc">Washington D.C.</option><option value="maryland">Maryland</option><option value="pg_county">Prince George&apos;s County</option></select></div>
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/30" onClick={() => fileInputRef.current?.click()}><Upload className="mb-2 h-8 w-8 text-slate-400" /><p className="text-sm font-medium text-slate-700">Upload lease (PDF or Word)</p><p className="text-xs text-slate-400">.pdf, .doc, .docx</p><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={isExtracting} />{isExtracting && <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><Loader2 className="h-3 w-3 animate-spin" /> Extracting&hellip;</p>}</div>
                  {extractError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{extractError}</p>}
                  <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">or paste lease text</span><div className="h-px flex-1 bg-slate-200" /></div>
                  <div><label className="text-sm font-medium text-slate-700">Lease text</label><textarea className="mt-1 min-h-[300px] w-full rounded-lg border border-slate-200 p-3 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Paste the full text of your lease here..." value={leaseText} onChange={(e) => setLeaseText(e.target.value)} /><p className="mt-1 text-xs text-slate-400">{leaseText.length} characters (min 100)</p></div>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || leaseText.length < 100} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">{isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing&hellip;</> : <>Analyze lease <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                  {isAnalyzing && (
                    <div className="space-y-2 rounded-lg bg-blue-50 border border-blue-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">{analysisProgress.message || "Starting analysis..."}</span>
                        <span className="text-xs text-blue-600 font-semibold">{analysisProgress.percent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-blue-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${analysisProgress.percent}%` }} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <AppFooterDisclaimer />
      </div>
    );
  }

  // ═══════════════════ POST-ANALYSIS ═══════════════════
  // Severity badge number component
  const NumBadge = ({ num, severity }: { num: number; severity: string }) => {
    const bg = severity === "red" ? "bg-red-500" : severity === "yellow" ? "bg-amber-500" : "bg-orange-500";
    return <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${bg} text-white text-[9px] font-bold mr-1 align-super cursor-pointer shrink-0`}>{num}</span>;
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* ── HEADER (dark gradient) ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 relative overflow-hidden shrink-0 z-20">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(59,130,246,0.08)_0%,_transparent_60%)]" />

        {/* Top row: Title + Actions */}
        <div className="relative flex items-start justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-start gap-3">
            <Link href="/dashboard" className="mt-1 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/70" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <FileSearch className="w-5 h-5 text-blue-400" />
                <h1 className="text-lg font-bold text-white">Lease Review</h1>
              </div>
              <p className="text-sm text-slate-400 mt-0.5 ml-[30px]">
                {JUR[jurisdiction] ?? jurisdiction} Residential Rental Agreement
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <UserCheck className="w-3.5 h-3.5" /> Human review required
            </span>
            <button onClick={() => { setResults(null); setSummary(null); setLeaseText(""); setFilter("all"); setPendingReplace(null); setAnalysisTime(null); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/[0.15] border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              New Review
            </button>
            <div className="relative" ref={exportRef}>
              <button onClick={() => setShowExportMenu((v) => !v)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>
              {showExportMenu && <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30">
                <button onClick={() => { dl(leaseText, `lease-revised-${new Date().toISOString().slice(0, 10)}.txt`); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">\ud83d\udcc4 Revised Lease (clean)</button>
                <button onClick={() => { dl(genRedline(leaseText, results ?? []), `lease-redlined-${new Date().toISOString().slice(0, 10)}.html`, "text/html;charset=utf-8"); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">\ud83d\udcdd Redlined Version</button>
                <button onClick={() => { dl(genReport(results ?? [], summary, jurisdiction, analysisTime), `compliance-report-${new Date().toISOString().slice(0, 10)}.txt`); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">\ud83d\udccb Compliance Report</button>
              </div>}
            </div>
          </div>
        </div>

        {/* Scorecard bar — embedded in dark header */}
        <div className="relative flex items-center gap-4 mt-4 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
          {/* Overall status */}
          <div className="flex items-center gap-2">
            {hasCritical ? <><XCircle className="w-5 h-5 text-red-400" /><span className="text-sm font-semibold text-red-400">Critical Issues</span></> : pendingCount > 0 ? <><AlertTriangle className="w-5 h-5 text-amber-400" /><span className="text-sm font-semibold text-amber-400">Issues to Review</span></> : <><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="text-sm font-semibold text-emerald-400">Compliant</span></>}
          </div>
          <div className="w-px h-5 bg-white/10" />

          {/* Severity counts */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className={`font-semibold ${redCount > 0 ? "text-red-400" : "text-slate-600"}`}>{summary?.redFlags ?? 0}</span>
              <span className="text-slate-500">Prohibited</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className={`font-semibold ${yellowCount > 0 ? "text-amber-400" : "text-slate-600"}`}>{summary?.yellowFlags ?? 0}</span>
              <span className="text-slate-500">Risky</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className={`font-semibold ${blueCount > 0 ? "text-orange-400" : "text-slate-600"}`}>{summary?.blueFlags ?? 0}</span>
              <span className="text-slate-500">Missing</span>
            </span>
          </div>
          <div className="w-px h-5 bg-white/10" />

          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} /></div>
            <span className="text-xs text-slate-500">{resolvedCount}/{totalCount} resolved</span>
          </div>

          {/* Right side: speed + time saved */}
          <div className="ml-auto flex items-center gap-3">
            {analysisDuration != null && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Zap className="w-3 h-3 text-amber-400" /> {analysisDuration}s
              </span>
            )}
            <div className="relative" ref={timeSavedRef}>
              <button onClick={() => setShowTimeSaved((v) => !v)} className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors" title="vs. manual attorney review">
                <Clock className="w-3 h-3" /> ~2.5 hrs saved
              </button>
              {showTimeSaved && <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg p-5 z-30">
                <h4 className="text-sm font-bold text-slate-900">Time &amp; cost savings</h4>
                <div className="mt-3 space-y-2.5">
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Attorney review</span><span className="text-sm font-semibold text-slate-700">2\u20133 hours</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Cost at $300/hr</span><span className="text-sm font-semibold text-slate-700">$600\u2013$900</span></div>
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between"><span className="text-xs text-slate-500">RentWise AI</span><span className="text-sm font-bold text-emerald-600">~{analysisDuration ?? 45}s &middot; Free</span></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">Based on DC metro attorney rates. Does not replace attorney review.</p>
              </div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO PANELS ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: DOCUMENT */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white border-r border-slate-200">
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm shrink-0">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"><Undo2 className="h-4 w-4" /></button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1 || history.length === 0} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"><Redo2 className="h-4 w-4" /></button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            {!isEditMode ? <button onClick={startEdit} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit</button> : <><button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"><CheckIcon className="w-3.5 h-3.5" /> Save</button><button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">Cancel</button></>}
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button onClick={() => setZoom((z) => Math.max(70, z - 10))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Minus className="h-3.5 w-3.5" /></button>
            <span className="text-xs text-slate-400 w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Plus className="h-3.5 w-3.5" /></button>
            <div className="flex-1" />
            <button onClick={() => setPanelOpen((v) => !v)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400">{panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}</button>
          </div>

          <div ref={documentPaneRef} className="flex-1 min-h-0 overflow-y-auto">
            {isEditMode ? (
              <div ref={editDocRef} contentEditable suppressContentEditableWarning className="w-full h-full min-h-[400px] px-10 py-8 text-sm focus:outline-none bg-white text-slate-700 leading-[1.8] whitespace-pre-wrap" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: `${zoom * 0.14}px` }}>
                {buildSegments(initialEditContentRef.current, results).map((seg, i) => { if (seg.type === "plain") return <span key={i}>{seg.text}</span>; const c = seg.severity === "red" ? "bg-red-100/70 border-b-2 border-red-400" : seg.severity === "yellow" ? "bg-amber-100/70 border-b-2 border-amber-400" : "bg-orange-50/70 border-b-2 border-orange-300"; return <span key={i} className={`rounded-sm px-0.5 ${c}`}>{seg.text}</span>; })}
              </div>
            ) : (
              <div className="px-10 py-8 text-slate-700 leading-[1.8] whitespace-pre-wrap selection:bg-blue-100" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: `${zoom * 0.14}px` }}>
                {(() => {
                  const seen = new Set<string>(); const pendShown = new Set<string>();
                  // Missing clauses (blue with no problematicText) — collect for insertion markers
                  const missingIssues = results?.filter((r) => r.severity === "blue" && !r.problematicText && r.status === "pending") ?? [];

                  const els = segments.map((seg, i) => {
                    if (seg.type === "plain") return <span key={i}>{seg.text}</span>;
                    const isFirst = !seen.has(seg.issueId); if (isFirst) seen.add(seg.issueId);
                    const isPend = pendingReplace?.issueId === seg.issueId;
                    const isPulse = pulseId === seg.issueId;
                    const isSel = selectedIssueId === seg.issueId;
                    const num = issueNumMap.get(seg.issueId) ?? 0;

                    if (isPend) {
                      const showDiff = isFirst && !pendShown.has(seg.issueId); if (showDiff) pendShown.add(seg.issueId);
                      return <span key={i} id={isFirst ? `clause-${seg.issueId}` : undefined}>
                        <span className="bg-red-100 text-red-700 line-through decoration-red-400 decoration-2 rounded-sm px-0.5">{seg.text}</span>
                        {showDiff && pendingReplace.replacement && <><span className="bg-emerald-100 text-emerald-700 rounded-sm px-0.5 font-medium">{pendingReplace.replacement}</span><span className="inline-flex items-center gap-1 ml-1.5 align-middle"><button onClick={(e) => { e.stopPropagation(); confirmReplace(); }} className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-0.5 transition-colors shadow-sm"><Check className="h-3 w-3" /> Apply</button><button onClick={(e) => { e.stopPropagation(); cancelReplace(); }} className="inline-flex items-center gap-0.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 transition-colors shadow-sm"><X className="h-3 w-3" /> Cancel</button></span></>}
                        {showDiff && !pendingReplace.replacement && <span className="inline-flex items-center gap-1 ml-1.5 align-middle"><button onClick={(e) => { e.stopPropagation(); confirmReplace(); }} className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-0.5 shadow-sm"><Check className="h-3 w-3" /> Remove</button><button onClick={(e) => { e.stopPropagation(); cancelReplace(); }} className="inline-flex items-center gap-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-medium px-2.5 py-0.5 shadow-sm"><X className="h-3 w-3" /> Cancel</button></span>}
                      </span>;
                    }

                    const hlClass = seg.severity === "red" ? "bg-red-100/70 border-b-2 border-red-400 hover:bg-red-200/80" : seg.severity === "yellow" ? "bg-amber-100/70 border-b-2 border-amber-400 hover:bg-amber-200/80" : "bg-orange-50/70 border-b-2 border-orange-300 hover:bg-orange-100/80";
                    return <span key={i} id={isFirst ? `clause-${seg.issueId}` : undefined} className={`cursor-pointer rounded-sm px-0.5 transition-colors ${hlClass} ${isSel ? "ring-2 ring-blue-400 ring-offset-1" : ""} ${isPulse ? "animate-clause-pulse" : ""}`} onClick={() => scrollToSuggestion(seg.issueId)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && scrollToSuggestion(seg.issueId)}>
                      {isFirst && <NumBadge num={num} severity={seg.severity} />}
                      {seg.text}
                    </span>;
                  });

                  // Append missing clause markers at the end
                  const missingEls = missingIssues.map((mi) => {
                    const num = issueNumMap.get(mi.id) ?? 0;
                    return <div key={`missing-${mi.id}`} id={`clause-${mi.id}`} className={`border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-lg px-3 py-2 my-2 cursor-pointer transition-colors hover:bg-orange-100/60 ${selectedIssueId === mi.id ? "ring-2 ring-blue-400 ring-offset-1" : ""} ${pulseId === mi.id ? "animate-clause-pulse" : ""}`} onClick={() => scrollToSuggestion(mi.id)}>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600"><NumBadge num={num} severity="blue" /> \u26a0 Missing: {mi.title}</span>
                    </div>;
                  });

                  return <>{els}{missingEls}</>;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: SUGGESTIONS */}
        <div className={`${panelOpen ? "w-[420px] min-w-[380px]" : "w-0 min-w-0 overflow-hidden"} transition-all duration-300 bg-slate-50 flex flex-col shrink-0 max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:h-full max-lg:z-30 max-lg:shadow-2xl max-lg:border-l max-lg:border-slate-200 ${!panelOpen ? "max-lg:translate-x-full" : "max-lg:translate-x-0"}`}>
          {/* Compact fixed header \u2014 title + filters only (Google Docs style) */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-900">Suggestions</span>
              <span className="w-6 h-6 rounded-full bg-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center">{totalCount}</span>
              <div className="flex-1" />
              <div className="relative" ref={shortcutsRef}>
                <button onClick={() => setShowShortcuts((v) => !v)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Keyboard shortcuts"><Keyboard className="w-3.5 h-3.5 text-slate-500" /></button>
                {showShortcuts && <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg border border-slate-200 shadow-lg p-3 text-xs text-slate-500 space-y-1 z-20">
                  <p><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">↑↓</kbd> Navigate</p>
                  <p><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> Expand</p>
                  <p><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">A</kbd> Accept <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono ml-1">I</kbd> Ignore</p>
                </div>}
              </div>
              <button onClick={() => setPanelOpen(false)} className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-400"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {([
                { key: "all" as const, label: `All (${pendingCount})` },
                { key: "red" as const, label: `Prohibited (${summary?.redFlags ?? 0})` },
                { key: "blue" as const, label: `Missing (${summary?.blueFlags ?? 0})` },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${filter === key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {label}
                </button>
              ))}
              {/* History tab */}
              <button onClick={() => setFilter("resolved")} className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${filter === "resolved" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                <RotateCcw className="w-3 h-3" /> History ({resolvedCount + ignoredCount})
              </button>
            </div>
          </div>

          {/* Scrollable area \u2014 alerts + cards scroll together (Google Docs style) */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
            {/* Alerts */}
            {hasJM && !dismissedJurisdiction && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 relative">
                <button onClick={() => setDismissedJurisdiction(true)} className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100"><X className="w-3.5 h-3.5" /></button>
                <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-xs font-bold text-amber-800">Jurisdiction Mismatch Detected</span></div>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">This lease references a different jurisdiction than the property. Resolve first.</p>
              </div>
            )}
            {hasJM && dismissedJurisdiction && (
              <button onClick={() => setDismissedJurisdiction(false)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">⚠ Jurisdiction mismatch &mdash; click to review</button>
            )}
            {hasFH && !dismissedFairHousing && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 relative">
                <button onClick={() => setDismissedFairHousing(true)} className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center text-violet-400 hover:text-violet-600 hover:bg-violet-100"><X className="w-3.5 h-3.5" /></button>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-violet-600" /><span className="text-xs font-bold text-violet-800">Fair Housing Flag</span></div>
                <p className="text-[11px] text-violet-600 mt-1 leading-relaxed">Potential source-of-income discrimination detected. Voucher holders are protected.</p>
              </div>
            )}
            {hasFH && dismissedFairHousing && (
              <button onClick={() => setDismissedFairHousing(false)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">⚠ Fair housing flag &mdash; click to review</button>
            )}

            {/* AI Summary \u2014 scrolls with cards */}
            {summary?.overallAssessment && (
              <div className="bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-[11px] font-semibold text-blue-600 mb-1">⚡ AI Summary</p>
                <p className={`text-sm text-slate-600 leading-relaxed ${!summaryExpanded ? "line-clamp-2" : ""}`}>{summary.overallAssessment}</p>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => setSummaryExpanded((v) => !v)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">{summaryExpanded ? "Show less" : "Read more"}</button>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Feb 2026</span>
                  <Link href="/testing" className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto">Validation <ExternalLink className="w-3 h-3" /></Link>
                </div>
              </div>
            )}

            {/* Suggestion cards */}
            {filteredResults.length === 0 && <div className="text-center py-12 text-slate-400"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium">No suggestions here</p></div>}
            {filteredResults.map((issue) => {
              const isExp = expandedIds.has(issue.id); const isSel = selectedIssueId === issue.id;
              const isAcc = issue.status === "accepted"; const isIgn = issue.status === "rejected";
              const num = issueNumMap.get(issue.id) ?? 0;
              const sevBg = issue.severity === "red" ? "bg-red-100 text-red-600" : issue.severity === "yellow" ? "bg-amber-100 text-amber-600" : "bg-orange-100 text-orange-600";
              const sevBadge = issue.severity === "red" ? "bg-red-50 text-red-600 border-red-200" : issue.severity === "yellow" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-orange-50 text-orange-600 border-orange-200";
              const isFH2 = (issue as any).isFairHousingFlag;
              const cit = findCitationByCode(issue.citedStatute, jurisdiction);

              return <div key={issue.id} id={`suggestion-${issue.id}`} className={`bg-white rounded-xl border mb-3 transition-all ${isSel ? "border-blue-300 shadow-sm shadow-blue-100 ring-1 ring-blue-200" : isAcc ? "border-emerald-200 bg-emerald-50/30" : isIgn ? "border-slate-200 opacity-60" : "border-slate-200 hover:border-slate-300"}`}>
                <button type="button" className="w-full text-left p-4" onClick={() => { if (!isAcc && !isIgn) { toggleExpanded(issue.id); scrollToClause(issue.id); } }}>
                  <div className="flex items-start gap-2.5">
                    {/* Number badge */}
                    <span className={`w-6 h-6 rounded-full ${sevBg} text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{num}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${sevBadge}`}>{issue.severity === "red" ? "Prohibited" : issue.severity === "yellow" ? "Risky" : "Missing"}</span>
                        {isFH2 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-600 border-violet-200 flex items-center gap-0.5"><Shield className="h-3 w-3" /> Fair Housing</span>}
                        {isAcc && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-0.5"><Check className="h-3 w-3" /> Accepted</span>}
                        {isIgn && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Ignored</span>}
                        <div className="flex-1" />
                        {!isAcc && !isIgn && (isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
                      </div>
                      <p className={`mt-1.5 text-sm font-semibold leading-snug ${isIgn ? "text-slate-400 line-through" : "text-slate-900"}`}>{issue.title}</p>
                      {!isExp && !isAcc && !isIgn && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{issue.summary}</p>}
                      {/* Undo button for resolved/ignored items */}
                      {(isAcc || isIgn) && (
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={(e) => { e.stopPropagation(); undoAction(issue.id); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded-md hover:bg-slate-100 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Undo
                          </button>
                          {isAcc && issue.suggestedReplacement && <span className="text-[11px] text-emerald-500 italic line-clamp-1">Added: {issue.suggestedReplacement.slice(0, 60)}{issue.suggestedReplacement.length > 60 ? "…" : ""}</span>}
                          {isIgn && <span className="text-[11px] text-slate-400 italic">Dismissed</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {isExp && !isAcc && !isIgn && (
                  <div className="px-4 pb-4 space-y-3">
                    {issue.problematicText && <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Flagged text</p><div className="mt-1.5 bg-red-50 border-l-[3px] border-red-400 rounded-r-lg p-3"><p className="text-sm text-red-800 italic leading-relaxed line-through decoration-red-300 decoration-2">&ldquo;{issue.problematicText}&rdquo;</p></div></div>}
                    <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Why this matters</p><p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{issue.explanation}</p></div>
                    {issue.suggestedReplacement && <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended change</p><div className="mt-1.5 bg-emerald-50 border-l-[3px] border-emerald-400 rounded-r-lg p-3"><p className="text-sm text-emerald-800 leading-relaxed">{issue.suggestedReplacement}</p></div></div>}
                    {!issue.suggestedReplacement && issue.suggestedAction && <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested action</p><p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{issue.suggestedAction}</p></div>}
                    <div><p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-3">Legal basis</p><div className="flex items-start gap-2 mt-1.5 bg-slate-50 rounded-lg p-3 border border-slate-100"><Scale className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-semibold text-slate-700">{issue.citedStatute}</p>{cit ? <><p className="text-xs text-slate-500 mt-0.5">{cit.title}</p><p className="text-xs text-slate-400 mt-0.5">{cit.summary}</p>{cit.url && <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1">View source <ExternalLink className="w-3 h-3" /></a>}</> : <>{(issue as any).statuteTitle && <p className="text-xs text-slate-500 mt-0.5">{(issue as any).statuteTitle}</p>}{(issue as any).statuteSummary && <p className="text-xs text-slate-400 mt-0.5">{(issue as any).statuteSummary}</p>}</>}</div></div></div>
                    <div className="flex items-center gap-2"><ConfidenceBadge level={issue.confidenceLevel} /></div>
                    <PerSuggestionDisclaimer confidence={issue.confidenceLevel} />
                    {pendingReplace?.issueId === issue.id && <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 flex items-center gap-2"><Eye className="h-3.5 w-3.5 shrink-0" /> Previewing in document. <strong>Apply</strong> or <strong>Cancel</strong> inline.</div>}
                    {issue.status === "pending" && !pendingReplace?.issueId && <div className="flex items-center gap-2 pt-3 border-t border-slate-100"><button onClick={() => handleAction(issue.id, "accepted")} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"><Check className="w-3.5 h-3.5" /> Accept Change</button><button onClick={() => handleAction(issue.id, "rejected")} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg">Ignore</button>{issue.problematicText && <button onClick={() => { startEdit(); scrollToClause(issue.id); }} className="text-sm text-slate-500 hover:text-slate-700 font-medium ml-auto">Edit Manually</button>}</div>}
                    {issue.status === "pending" && pendingReplace?.issueId && pendingReplace.issueId !== issue.id && <div className="flex items-center gap-2 pt-3 border-t border-slate-100 opacity-40 pointer-events-none"><button disabled className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"><Check className="w-3.5 h-3.5" /> Accept</button><button disabled className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg">Ignore</button></div>}
                  </div>
                )}
              </div>;
            })}

            {filter === "all" && <details className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"><span className="flex items-center gap-2 text-sm font-medium text-slate-700"><AlertCircle className="w-4 h-4 text-slate-400" /> What this review may miss</span><ChevronDown className="w-4 h-4 text-slate-400" /></summary>
              <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed space-y-2">
                <ul className="list-disc pl-4 space-y-1"><li>Issues requiring context beyond the lease text</li><li>Novel lease structures</li><li>Amendments after February 2026</li><li>Market reasonableness of dollar amounts</li><li>Verification of factual claims (licensing, lead certs)</li></ul>
                <p className="font-medium text-slate-600">Always have an attorney review before execution.</p>
                <Link href="/testing" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">Full testing results <ExternalLink className="w-3 h-3" /></Link>
              </div>
            </details>}
          </div>
        </div>
      </div>

      {!panelOpen && <button onClick={() => setPanelOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700"><PanelRightOpen className="h-5 w-5" />{pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>}</button>}
    </div>
  );
}
