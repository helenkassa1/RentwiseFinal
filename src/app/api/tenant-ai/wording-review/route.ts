/**
 * POST /api/tenant-ai/wording-review
 * Review proposed clause wording — clarity, issues, suggested rewrite, negotiation phrasing.
 */

import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are a tenant-rights assistant helping a renter improve proposed lease wording.

TASK: Review the "proposed text" the user pasted. Respond with a short JSON object (no markdown, no code fence) in this exact shape:
{
  "clarity": "clear" or "needs_work",
  "issues": ["issue 1", "issue 2"] or [],
  "suggestedRewrite": "improved full text",
  "notes": ["note 1"] or [],
  "negotiationVersion": "one sentence: how to say this politely to the landlord" or omit,
  "disclaimer": "Short sentence: This isn't legal advice; consult an attorney."
}

RULES:
- If the proposed text is vague, unfair, or missing key protections, set clarity to "needs_work" and list specific issues.
- suggestedRewrite must be a full replacement the tenant could paste into the lease or send to the landlord.
- Keep issues and notes brief. negotiationVersion is optional—only if it helps them phrase the ask.
- Always include a brief disclaimer.`;

function buildUserPrompt(params: {
  termName: string;
  whatItMeans: string;
  proposedText: string;
  jurisdiction?: string;
}): string {
  const parts: string[] = ["[Lease term] " + params.termName];
  parts.push("What it means: " + params.whatItMeans);
  if (params.jurisdiction) parts.push("Jurisdiction: " + params.jurisdiction);
  parts.push("");
  parts.push("Proposed text to review:\n" + params.proposedText);
  return parts.join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantContext = body.tenantContext as Record<string, unknown> | undefined;
    const termId = typeof body.termId === "string" ? body.termId : "";
    const termData = body.termData as {
      termName?: string;
      whatItMeans?: string;
      whyItMatters?: string;
    } | undefined;
    const proposedText = typeof body.proposedText === "string" ? body.proposedText.trim() : "";

    if (!proposedText || !termData) {
      return NextResponse.json(
        { error: "proposedText and termData required" },
        { status: 400 }
      );
    }

    const jurisdiction =
      tenantContext && typeof tenantContext.jurisdiction === "string"
        ? tenantContext.jurisdiction
        : undefined;

    const userPrompt = buildUserPrompt({
      termName: termData.termName ?? "Lease term",
      whatItMeans: termData.whatItMeans ?? "",
      proposedText,
      jurisdiction,
    });

    const { content } = await callAI(SYSTEM_PROMPT, userPrompt, {
      maxTokens: 1024,
      temperature: 0.2,
    });

    const text = (content ?? "").trim();
    let parsed: {
      clarity?: string;
      issues?: string[];
      suggestedRewrite?: string;
      notes?: string[];
      negotiationVersion?: string;
      disclaimer?: string;
    } = {};

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
      } catch {
        // fallback below
      }
    }

    const clarity = parsed.clarity === "clear" ? "clear" : "needs_work";
    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const suggestedRewrite =
      typeof parsed.suggestedRewrite === "string" && parsed.suggestedRewrite.trim()
        ? parsed.suggestedRewrite.trim()
        : proposedText;
    const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
    const negotiationVersion =
      typeof parsed.negotiationVersion === "string" ? parsed.negotiationVersion : undefined;
    const disclaimer =
      typeof parsed.disclaimer === "string"
        ? parsed.disclaimer
        : "This isn't legal advice. Consult an attorney for your situation.";

    return NextResponse.json({
      clarity,
      issues,
      suggestedRewrite,
      notes,
      negotiationVersion,
      disclaimer,
    });
  } catch (err) {
    console.error("Wording review API error:", err);
    return NextResponse.json(
      {
        clarity: "needs_work",
        issues: [err instanceof Error ? err.message : "Review failed. Try again."],
        suggestedRewrite: "",
        notes: [],
        disclaimer: "This isn't legal advice. Consult an attorney for your situation.",
      },
      { status: 200 }
    );
  }
}
