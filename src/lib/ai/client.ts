import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@/lib/db";
import { legalStatutes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// AI Client - Anthropic Primary, OpenAI Fallback
// ============================================

// Read env vars from .env.local as fallback when Next.js doesn't inject them
// (workaround for Turbopack workspace root issues with git worktrees)
function readEnvLocal(key: string): string | undefined {
  const fromEnv = process.env[key];
  if (fromEnv && fromEnv.trim()) return fromEnv;
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
    return match?.[1]?.trim() || undefined;
  } catch {
    return undefined;
  }
}

// Lazy init so build succeeds when env vars are not set (e.g. Vercel build)
function getAnthropic() {
  const apiKey = readEnvLocal("ANTHROPIC_API_KEY") ?? "";
  return new Anthropic({ apiKey });
}

function getOpenAI(): OpenAI | null {
  const key = readEnvLocal("OPENAI_API_KEY");
  if (!key || key.trim() === "") return null;
  return new OpenAI({ apiKey: key });
}

export type AIResponse = {
  content: string;
  model: string;
  provider: "anthropic" | "openai";
};

/**
 * Stream AI response as a ReadableStream of text chunks.
 * Used for lease review to show progress in real-time.
 */
export function callAIStream(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number }
): ReadableStream<Uint8Array> {
  const maxTokens = options?.maxTokens ?? 4096;
  const temperature = options?.temperature ?? 0.2;
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const anthropic = getAnthropic();
      if (anthropic) {
        try {
          const stream = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            temperature,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
          return;
        } catch (error) {
          console.error("Anthropic stream error, falling back to OpenAI:", error);
        }
      }

      // Fallback to OpenAI streaming
      const openai = getOpenAI();
      if (!openai) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: "AI service temporarily unavailable." }))
        );
        controller.close();
        return;
      }
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: maxTokens,
          temperature,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        console.error("OpenAI stream fallback failed:", err);
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: "AI service temporarily unavailable." }))
        );
        controller.close();
      }
    },
  });
}

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
    const anthropic = getAnthropic();
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

    // Fallback to OpenAI (only if key is set)
    const openai = getOpenAI();
    if (!openai) {
      throw new Error("AI service temporarily unavailable. Please try again later.");
    }
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
