/**
 * POST /api/lease/review
 * AI-powered lease review for DC, Maryland, Prince George's County.
 * PRD §4.2 Lease Agreement Reviewer — multi-step legal analysis, UPL disclaimers.
 */

import { NextResponse } from "next/server";
import { reviewLease } from "@/lib/ai/services";

const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_LENGTH = 200_000;

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
      return NextResponse.json(
        { error: `Lease text must be at least ${MIN_TEXT_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (leaseText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Lease text is too long. Maximum ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const { results, summary, unverifiedCitations } = await reviewLease(
      leaseText,
      jurisdiction
    );

    return NextResponse.json({
      results,
      summary,
      unverifiedCitations: unverifiedCitations ?? [],
    });
  } catch (err) {
    console.error("Lease review error:", err);
    const message =
      err instanceof Error ? err.message : "Lease review failed.";
    return NextResponse.json(
      {
        error:
          message.includes("temporarily unavailable")
            ? message
            : "Analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
