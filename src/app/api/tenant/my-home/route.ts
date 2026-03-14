import { NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { tenants, units, properties, leases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/tenant/my-home
 * Returns the current tenant's linked property/unit/lease data.
 */
export async function GET() {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find tenant record for this user
    const [tenantRecord] = await db
      .select({
        id: tenants.id,
        unitId: tenants.unitId,
        landlordId: tenants.landlordId,
        name: tenants.name,
        moveInDate: tenants.moveInDate,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(and(eq(tenants.userId, dbUser.id), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenantRecord) {
      return NextResponse.json({ linked: false });
    }

    // Get unit + property details
    const [unitInfo] = await db
      .select({
        unitId: units.id,
        unitIdentifier: units.identifier,
        bedrooms: units.bedrooms,
        bathrooms: units.bathrooms,
        squareFeet: units.squareFeet,
        rentAmount: units.rentAmount,
        propertyId: properties.id,
        propertyName: properties.name,
        propertyAddress: properties.address,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        jurisdiction: properties.jurisdiction,
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(units.id, tenantRecord.unitId))
      .limit(1);

    // Get active lease if any
    const [activeLease] = await db
      .select({
        id: leases.id,
        status: leases.status,
        startDate: leases.startDate,
        endDate: leases.endDate,
        rentAmount: leases.rentAmount,
        securityDeposit: leases.securityDeposit,
      })
      .from(leases)
      .where(
        and(
          eq(leases.tenantId, tenantRecord.id),
          eq(leases.status, "active"),
        ),
      )
      .limit(1);

    return NextResponse.json({
      linked: true,
      tenant: tenantRecord,
      unit: unitInfo ?? null,
      lease: activeLease ?? null,
    });
  } catch (err) {
    console.error("My-home API error:", err);
    return NextResponse.json(
      { error: "Failed to load home data" },
      { status: 500 },
    );
  }
}
