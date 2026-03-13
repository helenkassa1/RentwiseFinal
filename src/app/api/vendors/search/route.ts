/**
 * POST /api/vendors/search
 * PRD §4.3 Repair Suggestion Engine — Thumbtack, TaskRabbit, Google Local Services.
 * Returns licensed-professional suggestions for maintenance/repairs.
 */

import { NextResponse } from "next/server";
import type { Trade, VendorResult } from "@/lib/vendors/types";
import { searchGooglePlaces } from "@/lib/vendors/googlePlaces";
import { searchThumbtack } from "@/lib/vendors/thumbtack";
import { searchTaskrabbit } from "@/lib/vendors/taskrabbit";

const TRADES: Trade[] = [
  "plumbing",
  "hvac",
  "electrical",
  "handyman",
  "pest",
  "locksmith",
  "cleaning",
  "general",
];

function withLicenseStatus(
  raw: Omit<VendorResult, "licenseStatus" | "licenseNotes">
): VendorResult {
  return {
    ...raw,
    licenseStatus: raw.licenseNumber ? "unverified" : "not_provided",
    licenseNotes: raw.licenseNumber
      ? "Verify via official registry before hiring."
      : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const trade =
      typeof body.trade === "string" && TRADES.includes(body.trade as Trade)
        ? (body.trade as Trade)
        : "general";
    const locationText =
      typeof body.locationText === "string" && body.locationText.trim()
        ? body.locationText.trim()
        : "";
    const includeUnverified = Boolean(body.includeUnverified);

    if (!locationText) {
      return NextResponse.json(
        { error: "Location (address or city) is required." },
        { status: 400 }
      );
    }

    const query = `${trade} repair near ${locationText}`;
    const [google, thumbtack, taskrabbit] = await Promise.all([
      searchGooglePlaces({ query, trade }),
      searchThumbtack({ trade, locationText }),
      searchTaskrabbit({ trade, locationText }),
    ]);

    let results: VendorResult[] = [
      ...google.map(withLicenseStatus),
      ...thumbtack.map(withLicenseStatus),
      ...taskrabbit.map(withLicenseStatus),
    ];

    if (!includeUnverified) {
      results = results.filter((r) => r.licenseStatus === "verified");
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Vendor search error:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
