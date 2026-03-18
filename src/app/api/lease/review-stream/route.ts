/**
 * POST /api/lease/review-stream
 * Streaming version of lease review — sends progress updates + final results.
 * Uses SSE-style JSON lines: each line is a JSON object with a "type" field.
 */

import { callAIStream, parseAIJSON, verifyCitations } from "@/lib/ai/client";
import { getLeaseReviewPrompt } from "@/lib/ai/prompts";
import type { LeaseReviewResult } from "@/lib/db/schema";

const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_LENGTH = 200_000;

type LeaseReviewAIResponse = {
  issues: Array<{
    id: string;
    issueType: "prohibited" | "risky" | "missing";
    severity: "red" | "yellow" | "blue";
    title: string;
    summary: string;
    problematicText: string | null;
    explanation: string;
    citedStatute: string;
    suggestedAction: string;
    suggestedReplacement: string | null;
    confidenceLevel: "high" | "medium" | "low";
  }>;
  summary: {
    totalIssues: number;
    redFlags: number;
    yellowFlags: number;
    blueFlags: number;
    overallAssessment: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const leaseText =
      typeof body.leaseText === "string" ? body.leaseText.trim() : "";
    const jurisdiction =
      typeof body.jurisdiction === "string" &&
      ["dc", "maryland", "pg_county"].includes(body.jurisdiction)
        ? body.jurisdiction
        : "dc";

    if (leaseText.length < MIN_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Lease text must be at least ${MIN_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (leaseText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Lease text is too long. Maximum ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = getLeaseReviewPrompt(jurisdiction);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        };

        // Phase 1: Send progress update
        send({ type: "progress", phase: "analyzing", message: "Analyzing lease clauses..." });

        // Collect streamed AI response
        let fullContent = "";
        let chunkCount = 0;
        const aiStream = callAIStream(
          systemPrompt,
          `Please review the following lease agreement:\n\n${leaseText}`,
          { maxTokens: 8192 }
        );

        const reader = aiStream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
          chunkCount++;

          // Send periodic progress (every 20 chunks ≈ every few seconds)
          if (chunkCount % 20 === 0) {
            // Estimate progress by content length (typical response ~4000-6000 chars)
            const estimatedProgress = Math.min(85, Math.round((fullContent.length / 5000) * 80));
            send({
              type: "progress",
              phase: "analyzing",
              message: "Reviewing clauses and checking statutes...",
              percent: estimatedProgress,
            });
          }
        }

        // Phase 2: Parse and verify
        send({ type: "progress", phase: "verifying", message: "Verifying legal citations...", percent: 90 });

        try {
          const parsed = parseAIJSON<LeaseReviewAIResponse>(fullContent);

          // Verify citations
          const allCitations = parsed.issues.map((i) => i.citedStatute);
          const { unverified } = await verifyCitations(allCitations, jurisdiction);

          // Map to LeaseReviewResult format
          const results: LeaseReviewResult[] = parsed.issues.map((issue) => ({
            ...issue,
            problematicText: issue.problematicText ?? undefined,
            suggestedReplacement: issue.suggestedReplacement ?? undefined,
            status: "pending" as const,
            ...(unverified.includes(issue.citedStatute)
              ? {
                  explanation:
                    issue.explanation +
                    "\n\n⚠️ This suggestion could not be verified against our legal database. Please consult an attorney.",
                }
              : {}),
          }));

          // Phase 3: Send final results
          send({
            type: "complete",
            results,
            summary: parsed.summary,
            unverifiedCitations: unverified,
          });
        } catch (parseErr) {
          console.error("Parse error:", parseErr);
          send({ type: "error", error: "Failed to parse analysis. Please try again." });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Lease review stream error:", err);
    return new Response(
      JSON.stringify({ error: "Analysis failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
