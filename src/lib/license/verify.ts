import type { Jurisdiction, Trade } from "@/lib/vendors/types";

/**
 * License verification strategy:
 * - If we have licenseNumber: verify via jurisdiction/trade registry connector.
 * - If no licenseNumber: return not_provided.
 *
 * NOTE: Registry lookup differs by jurisdiction/trade.
 * Implement connectors as you onboard them.
 */
export async function verifyLicense(params: {
  jurisdiction: Jurisdiction;
  trade: Trade;
  licenseNumber?: string;
  vendorName: string;
}): Promise<{ status: "verified" | "unverified" | "not_provided"; notes?: string }> {
  const { licenseNumber } = params;

  if (!licenseNumber) {
    return { status: "not_provided", notes: "Vendor did not provide a license number." };
  }

  // TODO: implement real registry checks:
  // - DC: trade licenses often through DC DOB (varies by trade)
  // - MD/PG: MD DLLR / county-level where applicable
  // For now, mark as unverified until registry connectors are added.
  return {
    status: "unverified",
    notes:
      "License verification connector not configured yet. Verify via official registry before hiring.",
  };
}
