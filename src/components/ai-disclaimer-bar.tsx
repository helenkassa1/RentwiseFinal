"use client";

import { Scale, Info, Shield, CheckCircle2, AlertCircle, UserCheck } from "lucide-react";

/* ── Global AI Disclaimer Banner ─────────────────────────────────────── */
export function AIDisclaimerBar() {
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-700 leading-relaxed">
        <span className="font-semibold">AI-Powered Analysis</span> &mdash; This tool provides legal information based on DC and Maryland housing codes, not legal advice. It does not create an attorney-client relationship. Laws change &mdash; always verify with current statutes and consult a licensed attorney for specific legal situations.
      </p>
    </div>
  );
}

/* ── Pre-Analysis Disclaimer (with acknowledgment) ───────────────────── */
export function AIPreAnalysisDisclaimer({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">AI Analysis Disclaimer</h4>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              This analysis is powered by AI and is for <strong>informational purposes only</strong>. It does not constitute legal advice from a licensed attorney and does not create an attorney-client relationship. Results should be verified by a qualified legal professional before taking action.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-800">Your privacy matters</p>
          <p className="text-xs text-blue-600 leading-relaxed mt-0.5">
            Your lease documents are processed securely and encrypted in transit. Documents are used solely for analysis and are not shared with third parties. You can delete your documents at any time from your account settings.
          </p>
        </div>
      </div>

      <button
        onClick={onAcknowledge}
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
      >
        I Understand &mdash; Proceed to Analysis
      </button>
    </div>
  );
}

/* ── Human-in-the-Loop Indicator ─────────────────────────────────────── */
export function HumanReviewIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <UserCheck className="w-3.5 h-3.5" />
      <span>Human review required &mdash; AI suggestions are not auto-applied</span>
    </div>
  );
}

/* ── Confidence Badge ────────────────────────────────────────────────── */
export function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  if (level === "high") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
        <CheckCircle2 className="w-3 h-3" /> High confidence
      </span>
    );
  }
  if (level === "medium") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
        <AlertCircle className="w-3 h-3" /> Review recommended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
      <AlertCircle className="w-3 h-3" /> Verify with attorney
    </span>
  );
}

/* ── Per-suggestion Disclaimer ───────────────────────────────────────── */
export function PerSuggestionDisclaimer({ confidence }: { confidence: "high" | "medium" | "low" }) {
  if (confidence === "high") return null;
  const message =
    confidence === "medium"
      ? "Verify with legal counsel before relying on this guidance."
      : "This suggestion has low confidence. Strongly recommend consulting an attorney.";
  return (
    <p className="text-[11px] italic text-amber-600 leading-relaxed">
      \u26a0\ufe0f {message}
    </p>
  );
}

/* ── Suggestion disclaimer (alias) ───────────────────────────────────── */
export function SuggestionDisclaimer({ confidence }: { confidence: "high" | "medium" | "low" }) {
  return <PerSuggestionDisclaimer confidence={confidence} />;
}

/* ── Footer Disclaimer ───────────────────────────────────────────────── */
export function AppFooterDisclaimer() {
  return (
    <footer className="px-6 py-4 border-t border-slate-100 mt-auto">
      <p className="text-[11px] text-slate-400 leading-relaxed max-w-3xl mx-auto text-center">
        RentWise provides AI-powered legal information tools for educational and informational purposes only. Our services do not constitute legal advice from a licensed attorney and do not create an attorney-client relationship. AI analysis is based on DC and Maryland housing codes as of February 2026. Laws are subject to change. Consult a qualified legal professional for specific legal situations.
      </p>
    </footer>
  );
}
