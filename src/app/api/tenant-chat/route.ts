/**
 * POST /api/tenant-chat
 * Tenant Rights Guide chat — uses AI with jurisdiction + category context.
 * Fetches legal statutes from DB so responses can include code citations for verification.
 * Public route (no auth) so tenant-rights page works for everyone.
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

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildUserMessage(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";
  const last = messages[messages.length - 1];
  if (last.role !== "user") return "";
  if (messages.length === 1) return last.content;
  const history = messages.slice(0, -1).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
  return `Conversation so far:\n${history}\n\nLatest user message:\n${last.content}`;
}

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
    const hasAiKey =
      typeof process.env.ANTHROPIC_API_KEY === "string" && process.env.ANTHROPIC_API_KEY.length > 0 ||
      typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0;
    if (!hasAiKey) {
      return NextResponse.json({
        content:
          "The chat isn't configured yet (missing AI API key). Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local and restart the server. For now, you can look up tenant rights at your local housing authority or legal aid.",
      });
    }

    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages as ChatMessage[] : [];
    const jurisdiction = typeof body.jurisdiction === "string" && (body.jurisdiction === "dc" || body.jurisdiction === "pg") ? body.jurisdiction : null;
    const selectedCategory = typeof body.selectedCategory === "string" ? body.selectedCategory : undefined;
    const clientKbSnippets = typeof body.kbSnippets === "string" ? body.kbSnippets : undefined;

    const dbSnippets = await fetchStatutesForJurisdiction(jurisdiction);
    const kbSnippets = [clientKbSnippets, dbSnippets].filter(Boolean).join("\n\n") || undefined;

    const userMessage = buildUserMessage(messages);
    if (!userMessage.trim()) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const context = buildTenantChatContext({
      jurisdiction,
      selectedCategory,
      kbSnippets,
    });
    const systemPrompt = `${TENANT_CHAT_SYSTEM_PROMPT}\n\n---\n\n${context}`;

    let content: string;
    try {
      const result = await callAI(systemPrompt, userMessage, {
        maxTokens: 2048,
        temperature: 0.3,
      });
      content = result.content ?? "I couldn't generate a response. Please try again.";
    } catch (aiErr) {
      console.error("Tenant chat AI error:", aiErr);
      const friendlyMessage =
        "I'm having trouble connecting right now. Please try again in a moment. If it keeps happening, try again later or contact support.";
      return NextResponse.json({ content: friendlyMessage });
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Tenant chat API error:", err);
    const message = err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
