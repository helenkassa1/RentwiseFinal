/**
 * POST /api/tenant-ai/suggestion-chat
 * Inline "Ask about this clause" chat — term-specific Q&A with optional follow-ups and draft suggestions.
 */

import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are a tenant-rights assistant helping a renter understand a specific lease term and their options.

RULES:
- Give plain-English explanations. You are not a lawyer; say so and suggest they consult an attorney for their situation.
- Answer based on the lease term context provided (what it means, why it matters, negotiation tips).
- When useful, suggest 1–3 short follow-up questions the user might ask next.
- When useful, offer 1–2 suggested draft messages (e.g. "How to ask for a waiver") with a short label and the exact text. Keep drafts polite and brief (2–4 sentences).
- Be concise. One focused answer per turn.`;

function buildUserPrompt(params: {
  termName: string;
  whatItMeans: string;
  whyItMatters: string;
  negotiationTip?: string;
  clauseExcerpt?: string;
  relatedRights?: string;
  jurisdiction?: string;
  userMessage: string;
  conversationHistory?: { role: string; content: string }[];
}): string {
  const parts: string[] = ["[Lease term context]"];
  parts.push(`Term: ${params.termName}`);
  parts.push(`What it means: ${params.whatItMeans}`);
  parts.push(`Why it matters: ${params.whyItMatters}`);
  if (params.negotiationTip) parts.push(`Negotiation tip: ${params.negotiationTip}`);
  if (params.clauseExcerpt) parts.push(`Clause excerpt: ${params.clauseExcerpt}`);
  if (params.relatedRights) parts.push(`Related rights: ${params.relatedRights}`);
  if (params.jurisdiction) parts.push(`Jurisdiction: ${params.jurisdiction}`);
  parts.push("");
  if (params.conversationHistory && params.conversationHistory.length > 0) {
    parts.push(
      "Conversation so far:\n" +
        params.conversationHistory.map((m) => `${m.role}: ${m.content}`).join("\n\n")
    );
    parts.push("");
  }
  parts.push("Latest user message:\n" + params.userMessage);
  return parts.join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantContext = body.tenantContext as Record<string, unknown> | undefined;
    const termId = typeof body.termId === "string" ? body.termId : "";
    const termData = body.termData as
      | { termName?: string; whatItMeans?: string; whyItMatters?: string; negotiationTip?: string; clauseExcerpt?: string; relatedRights?: string }
      | undefined;
    const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

    if (!userMessage || !termData?.termName) {
      return NextResponse.json(
        { error: "userMessage and termData.termName required" },
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
      whyItMatters: termData.whyItMatters ?? "",
      negotiationTip: termData.negotiationTip,
      clauseExcerpt: termData.clauseExcerpt,
      relatedRights: termData.relatedRights,
      jurisdiction,
      userMessage,
      conversationHistory,
    });

    const { content } = await callAI(SYSTEM_PROMPT, userPrompt, {
      maxTokens: 1536,
      temperature: 0.3,
    });

    const text = (content ?? "").trim();
    const followUpQuestions: string[] = [];
    const suggestedDrafts: { label: string; text: string }[] = [];
    let assistantMessage = text;
    let disclaimer: string | undefined;

    const disclaimerMatch = text.match(/\b(?:I'm not a lawyer|This isn't legal advice|consult (?:an? )?attorney)[^.]*\./i);
    if (disclaimerMatch) disclaimer = disclaimerMatch[0].trim();

    const followUpBlock = text.match(/(?:Follow[- ]?up questions?|You might ask):\s*([\s\S]*?)(?=\n\n|Suggested|$)/i);
    if (followUpBlock) {
      const bullets = followUpBlock[1].split(/\n[-*•]\s*/).map((s) => s.trim()).filter(Boolean);
      bullets.slice(0, 3).forEach((q) => followUpQuestions.push(q.replace(/^["']|["']$/g, "")));
    }

    const draftBlock = text.match(/(?:Suggested draft|Draft message)[s]?[:\s]*([\s\S]*?)(?=\n\n|$)/gi);
    if (draftBlock) {
      const block = draftBlock[0];
      const labelMatch = block.match(/(?:^|\n)([^:\n]+):\s*/);
      const draftText = block.replace(/^[^:\n]+:\s*/, "").trim().split(/\n\n/)[0];
      if (labelMatch && draftText) suggestedDrafts.push({ label: labelMatch[1].trim(), text: draftText });
    }

    if (!followUpQuestions.length && text.includes("?")) {
      const lines = text.split(/\n/).filter((l) => l.trim().endsWith("?"));
      lines.slice(0, 2).forEach((l) => followUpQuestions.push(l.trim()));
    }

    return NextResponse.json({
      assistantMessage,
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      suggestedDrafts: suggestedDrafts.length > 0 ? suggestedDrafts : undefined,
      disclaimer,
    });
  } catch (err) {
    console.error("Suggestion chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}
