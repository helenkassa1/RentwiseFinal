/**
 * POST /api/tenant-ai
 * General tenant Q&A (lease/rights) — same guide as tenant-chat, single message.
 * Fetches statutes so responses can include code citations. Used by TenantAIChat.
 */

import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { callAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { legalStatutes } from "@/lib/db/schema";
import {
  TENANT_CHAT_SYSTEM_PROMPT,
  buildTenantChatContext,
} from "@/lib/tenant-rights/tenant-chat-prompts";

async function fetchStatutesForJurisdiction(jurisdiction: "dc" | "pg" | null): Promise<string> {
  if (!jurisdiction) return "";
  try {
    const jurisdictions =
      jurisdiction === "pg"
        ? (["pg_county", "maryland"] as const)
        : (["dc"] as const);
    const rows = await db
      .select({ code: legalStatutes.code, title: legalStatutes.title, summary: legalStatutes.summary })
      .from(legalStatutes)
      .where(inArray(legalStatutes.jurisdiction, [...jurisdictions]));
    if (rows.length === 0) return "";
    return rows
      .map((r) => `Code: ${r.code}\nTitle: ${r.title}\nSummary: ${r.summary}`)
      .join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const jurisdiction =
      typeof body.jurisdiction === "string" && (body.jurisdiction === "dc" || body.jurisdiction === "pg")
        ? body.jurisdiction
        : null;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const kbSnippets = await fetchStatutesForJurisdiction(jurisdiction) || undefined;
    const context = buildTenantChatContext({
      jurisdiction,
      selectedCategory: undefined,
      kbSnippets,
    });
    const systemPrompt = `${TENANT_CHAT_SYSTEM_PROMPT}\n\n---\n\n${context}`;

    const { content } = await callAI(systemPrompt, message, {
      maxTokens: 2048,
      temperature: 0.3,
    });

    return NextResponse.json({
      reply: content ?? "I couldn't generate a response. Please try again.",
    });
  } catch (err) {
    console.error("Tenant AI API error:", err);
    const msg = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
