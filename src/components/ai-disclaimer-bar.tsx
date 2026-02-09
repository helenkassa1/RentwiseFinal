"use client";

import { Scale } from "lucide-react";

export function AIDisclaimerBar() {
  return (
    <div className="ai-disclaimer-bar flex items-center justify-center gap-2">
      <Scale className="h-3 w-3" />
      <span>
        RentWise AI provides compliance guidance, not legal advice. Consult a licensed attorney for legal decisions.
      </span>
    </div>
  );
}

export function AIPreAnalysisDisclaimer({ onAcknowledge }: { onAcknowledge: () => void }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <Scale className="mt-0.5 h-5 w-5 text-amber-600" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-900">AI Analysis Disclaimer</h4>
          <p className="mt-1 text-sm text-amber-800">
            This analysis is powered by AI and is for informational purposes only. It does not
            constitute legal advice from a licensed attorney. Results should be verified by a
            qualified legal professional.
          </p>
          <button
            onClick={onAcknowledge}
            className="mt-3 rounded-md bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            I Understand — Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-green-100 text-green-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Confidence
    </span>
  );
}

export function PerSuggestionDisclaimer({ confidence }: { confidence: "high" | "medium" | "low" }) {
  if (confidence === "high") return null;

  const message =
    confidence === "medium"
      ? "Verify with legal counsel before relying on this guidance."
      : "This suggestion has low confidence. Strongly recommend consulting an attorney.";

  return (
    <p className="mt-2 text-xs italic text-amber-700">
      ⚠️ {message}
    </p>
  );
}

export function SuggestionDisclaimer({ confidence }: { confidence: "high" | "medium" | "low" }) {
  if (confidence === "high") return null;
  
  return (
    <p className="mt-2 text-xs italic text-amber-700">
      {confidence === "medium"
        ? "Verify with legal counsel before relying on this guidance."
        : "This suggestion has low confidence. Strongly recommend consulting an attorney."}
    </p>
  );
}
