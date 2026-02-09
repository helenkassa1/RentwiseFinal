import type { VendorResult, Trade } from "@/lib/vendors/types";

/**
 * Uses Google Places API Text Search (server-side).
 * Set GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in env.
 * Returns vendors without guaranteed license numbers (mark as not_provided in search).
 */
export async function searchGooglePlaces(params: {
  query: string;
  trade: Trade;
}): Promise<Omit<VendorResult, "licenseStatus" | "licenseNotes">[]> {
  const key =
    process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", params.query);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: Array<{
      place_id?: string;
      name?: string;
      formatted_address?: string;
      rating?: number;
      user_ratings_total?: number;
    }>;
  };

  const results = (data.results || []).slice(0, 10).map((r) => ({
    id: `google:${r.place_id ?? ""}`,
    source: "google" as const,
    name: (r.name as string) ?? "Unknown",
    address: r.formatted_address,
    rating: typeof r.rating === "number" ? r.rating : undefined,
    reviewCount:
      typeof r.user_ratings_total === "number" ? r.user_ratings_total : undefined,
    mapsUrl: r.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${r.place_id}`
      : undefined,
  }));

  return results;
}
