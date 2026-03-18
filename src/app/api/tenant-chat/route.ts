/**
 * POST /api/tenant-chat
 * Tenant Rights Guide chat — uses AI with jurisdiction + category context.
 * Fetches legal statutes from DB so responses can include code citations for verification.
 * Public route (no auth) so tenant-rights page works for everyone.
 */

import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { callAI } from "@/lib/ai/client";
import { db } from "@/lib/db";
import { legalStatutes } from "@/lib/db/schema";
import {
  TENANT_CHAT_SYSTEM_PROMPT,
  buildTenantChatContext,
} from "@/lib/tenant-rights/tenant-chat-prompts";

/** Check .env.local directly as fallback when process.env is empty */
function hasEnvKey(varName: string): boolean {
  const val = process.env[varName];
  if (typeof val === "string" && val.trim().length > 0) return true;
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const eqIdx = trimmed.indexOf("=");
      const key = trimmed.slice(0, eqIdx).trim();
      if (key === varName) {
        const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (v.length > 0) return true;
      }
    }
  } catch { /* .env.local not found */ }
  return false;
}

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
    if (!hasEnvKey("ANTHROPIC_API_KEY") && !hasEnvKey("OPENAI_API_KEY")) {
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
