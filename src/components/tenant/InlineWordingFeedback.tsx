"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { KeyTerm } from "@/lib/tenant/types";
import type { WordingReviewPayload } from "@/lib/tenant/types";
import type { WordingReviewResponse } from "@/lib/tenant/types";

const PLACEHOLDER = "Paste the clause or wording you want to propose…";

export function InlineWordingFeedback({
  tenantContext,
  termId,
  termData,
  autoReviewDelayMs = 800,
}: {
  tenantContext: WordingReviewPayload["tenantContext"];
  termId: string;
  termData: KeyTerm;
  autoReviewDelayMs?: number;
}) {
  const [proposedText, setProposedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WordingReviewResponse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runReview = useCallback(
    async (textOverride?: string) => {
      const trimmed = (textOverride ?? proposedText).trim();
      if (!trimmed) {
        setResult(null);
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const res = await fetch("/api/tenant-ai/wording-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantContext,
            termId,
            termData,
            proposedText: trimmed,
          } satisfies WordingReviewPayload),
        });
      let data: (WordingReviewResponse & { error?: string }) | null = null;
      try {
        data = (await res.json()) as WordingReviewResponse & { error?: string };
      } catch {
        setResult({
          clarity: "needs_work",
          issues: ["The server couldn’t respond properly. Please try again."],
          suggestedRewrite: trimmed,
          notes: [],
          disclaimer: "This isn't legal advice. Consult an attorney for your situation.",
        });
        return;
      }
      if (!res.ok) {
        setResult({
          clarity: "needs_work",
          issues: [data?.error ?? "Review failed. Try again."],
          suggestedRewrite: trimmed,
          notes: [],
          disclaimer: "This isn't legal advice. Consult an attorney for your situation.",
        });
        return;
      }
      setResult(data);
      } catch {
        setResult({
          clarity: "needs_work",
          issues: ["Something went wrong. Please try again."],
          suggestedRewrite: trimmed,
          notes: [],
          disclaimer: "This isn't legal advice. Consult an attorney for your situation.",
        });
      } finally {
        setLoading(false);
      }
    },
    [tenantContext, termId, termData, proposedText]
  );

  const handleChange = (value: string) => {
    setProposedText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResult(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runReview(value);
    }, autoReviewDelayMs);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Paste proposed language; we’ll give clarity feedback and a suggested rewrite (not legal advice).
      </p>
      <textarea
        value={proposedText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={PLACEHOLDER}
        disabled={loading}
        className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        rows={3}
        aria-label="Proposed wording"
      />
      <div className="flex items-center gap-2">
<Button
              type="button"
              size="sm"
              onClick={() => runReview()}
              disabled={loading || !proposedText.trim()}
            >
          {loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Review
        </Button>
        {loading && (
          <span className="text-xs text-muted-foreground">Checking wording…</span>
        )}
      </div>
      {result && (
        <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            {result.clarity === "clear" ? (
              <CheckCircle className="h-4 w-4 text-green-600" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden />
            )}
            <span className="text-sm font-medium">
              {result.clarity === "clear" ? "Clear" : "Needs work"}
            </span>
          </div>
          {result.issues.length > 0 && (
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {result.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Suggested rewrite</p>
            <p className="mt-1 whitespace-pre-wrap rounded border bg-background p-2 text-sm">
              {result.suggestedRewrite}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-7 text-xs"
              onClick={() => navigator.clipboard.writeText(result.suggestedRewrite)}
            >
              <Copy className="mr-1 h-3 w-3" /> Copy
            </Button>
          </div>
          {result.notes.length > 0 && (
            <ul className="list-inside list-disc text-xs text-muted-foreground">
              {result.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          )}
          {result.negotiationVersion && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">How to phrase it politely</p>
              <p className="mt-1 text-xs text-muted-foreground">{result.negotiationVersion}</p>
            </div>
          )}
          {result.disclaimer && (
            <p className="text-xs italic text-muted-foreground">{result.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
}
