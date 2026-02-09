import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { legalStatutes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// AI Client - Anthropic Primary, OpenAI Fallback
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AIResponse = {
  content: string;
  model: string;
  provider: "anthropic" | "openai";
};

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<AIResponse> {
  const maxTokens = options?.maxTokens ?? 4096;
  const temperature = options?.temperature ?? 0.2; // Low temp for legal accuracy

  // Try Anthropic first
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in Anthropic response");
    }

    return {
      content: textContent.text,
      model: "claude-sonnet-4-20250514",
      provider: "anthropic",
    };
  } catch (error) {
    console.error("Anthropic API error, falling back to OpenAI:", error);

    // Fallback to OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return {
        content,
        model: "gpt-4o",
        provider: "openai",
      };
    } catch (fallbackError) {
      console.error("OpenAI fallback also failed:", fallbackError);
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    }
  }
}

/**
 * Parse AI response as JSON with error handling
 * Strips markdown code fences and tries to extract a JSON object if wrapped in text.
 */
export function parseAIJSON<T>(response: string): T {
  let cleaned = response.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract a JSON object from the response (e.g. AI added preamble)
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        // fall through to throw
      }
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Verify that all cited statutes exist in our legal knowledge base
 * Section 9.2 - Hallucination Prevention
 * On DB/connection failure, treats all citations as unverified so review still returns.
 */
export async function verifyCitations(
  citations: string[],
  jurisdiction: string
): Promise<{ verified: string[]; unverified: string[] }> {
  const verified: string[] = [];
  const unverified: string[] = [];

  try {
    const dbStatutes = await db
      .select({ code: legalStatutes.code })
      .from(legalStatutes)
      .where(eq(legalStatutes.jurisdiction, jurisdiction as "dc" | "maryland" | "pg_county"));

    const knownCodes = new Set(dbStatutes.map((s) => s.code.toLowerCase()));

    for (const citation of citations) {
      const normalized = citation.toLowerCase().trim();
      const isKnown = Array.from(knownCodes).some(
        (code) => code.includes(normalized) || normalized.includes(code)
      );
      if (isKnown) verified.push(citation);
      else unverified.push(citation);
    }
  } catch (err) {
    console.error("Citation verification failed, marking all as unverified:", err);
    unverified.push(...citations);
  }

  return { verified, unverified };
}
