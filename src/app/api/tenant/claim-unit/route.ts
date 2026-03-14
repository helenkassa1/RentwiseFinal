import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { units, properties, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/tenant/claim-unit
 * Tenant claims a specific unit. Creates the tenant record and marks the unit occupied.
 */
export async function POST(req: NextRequest) {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { unitId } = (await req.json()) as { unitId?: string };
    if (!unitId) {
      return NextResponse.json(
        { error: "unitId is required" },
        { status: 400 },
      );
    }

    // Fetch the unit + property to get landlordId
    const [unit] = await db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        identifier: units.identifier,
        status: units.status,
      })
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (unit.status !== "vacant") {
      return NextResponse.json(
        { error: "This unit is no longer available" },
        { status: 409 },
      );
    }

    const [property] = await db
      .select({ ownerId: properties.ownerId })
      .from(properties)
      .where(eq(properties.id, unit.propertyId))
      .limit(1);

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Check if tenant already has an active claim
    const existingTenants = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.userId, dbUser.id))
      .limit(1);

    if (existingTenants.length > 0) {
      return NextResponse.json(
        { error: "You already have a linked unit. Contact support to change." },
        { status: 409 },
      );
    }

    // Create tenant record
    const [newTenant] = await db
      .insert(tenants)
      .values({
        userId: dbUser.id,
        unitId: unit.id,
        landlordId: property.ownerId,
        name: [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") || null,
        email: dbUser.email,
        isActive: true,
        moveInDate: new Date(),
      })
      .returning();

    // Mark unit as occupied
    await db
      .update(units)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(units.id, unit.id));

    // Update user role to tenant if not already
    if (dbUser.role !== "tenant") {
      const { users: usersTable } = await import("@/lib/db/schema");
      await db
        .update(usersTable)
        .set({ role: "tenant", onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(usersTable.id, dbUser.id));
    } else {
      const { users: usersTable } = await import("@/lib/db/schema");
      await db
        .update(usersTable)
        .set({ onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(usersTable.id, dbUser.id));
    }

    return NextResponse.json({
      success: true,
      tenant: newTenant,
      unitIdentifier: unit.identifier,
    });
  } catch (err) {
    console.error("Claim unit error:", err);
    return NextResponse.json(
      { error: "Failed to claim unit" },
      { status: 500 },
    );
  }
}
