import { NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { tenants, units, properties, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/dashboard/tenants
 * Returns all tenants linked to the authenticated landlord's properties.
 */
export async function GET() {
  try {
    const dbUser = await ensureDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select({
        tenantId: tenants.id,
        tenantName: tenants.name,
        tenantEmail: tenants.email,
        tenantPhone: tenants.phone,
        moveInDate: tenants.moveInDate,
        isActive: tenants.isActive,
        unitIdentifier: units.identifier,
        unitId: units.id,
        propertyAddress: properties.address,
        propertyName: properties.name,
        propertyId: properties.id,
      })
      .from(tenants)
      .innerJoin(units, eq(tenants.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(tenants.landlordId, dbUser.id))
      .orderBy(tenants.createdAt);

    return NextResponse.json({ tenants: rows });
  } catch (err) {
    console.error("Dashboard tenants GET error:", err);
    return NextResponse.json(
      { error: "Failed to load tenants" },
      { status: 500 },
    );
  }
}
