import type { VendorResult, Trade } from "@/lib/vendors/types";

/**
 * DO NOT scrape Thumbtack. Use official partner/API if available.
 * This adapter returns empty until configured.
 */
export async function searchThumbtack(_params: {
  trade: Trade;
  locationText: string;
}): Promise<Omit<VendorResult, "licenseStatus" | "licenseNotes">[]> {
  return [];
}
