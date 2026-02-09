import type { VendorResult, Trade } from "@/lib/vendors/types";

/**
 * DO NOT scrape Taskrabbit. Use official methods if available.
 * This adapter returns empty until configured.
 */
export async function searchTaskrabbit(_params: {
  trade: Trade;
  locationText: string;
}): Promise<Omit<VendorResult, "licenseStatus" | "licenseNotes">[]> {
  return [];
}
