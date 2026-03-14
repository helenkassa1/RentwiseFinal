import { NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { properties, units, maintenanceRequests, tenants } from "@/lib/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";

export async function GET() {
  try {
    const user = await ensureDbUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For tenants, just return role so dashboard page redirects
    if (user.role === "tenant") {
      return NextResponse.json({ role: user.role });
    }

    // For landlords — compute real summary numbers
    const [maintCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceRequests)
      .where(
        and(
          eq(maintenanceRequests.landlordId, user.id),
          ne(maintenanceRequests.status, "completed"),
          ne(maintenanceRequests.status, "tenant_confirmed"),
        )
      );

    const [tenantCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenants)
      .where(and(eq(tenants.landlordId, user.id), eq(tenants.isActive, true)));

    const [propertyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(eq(properties.ownerId, user.id));

    const [unitCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, user.id));

    const [emergencyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceRequests)
      .where(
        and(
          eq(maintenanceRequests.landlordId, user.id),
          eq(maintenanceRequests.urgency, "emergency"),
          ne(maintenanceRequests.status, "completed"),
          ne(maintenanceRequests.status, "tenant_confirmed"),
        )
      );

    // Recent maintenance requests
    const recentRequests = await db
      .select({
        id: maintenanceRequests.id,
        category: maintenanceRequests.category,
        urgency: maintenanceRequests.urgency,
        status: maintenanceRequests.status,
        createdAt: maintenanceRequests.createdAt,
        unitIdentifier: units.identifier,
        propertyAddress: properties.address,
        tenantName: tenants.name,
      })
      .from(maintenanceRequests)
      .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .innerJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
      .where(eq(maintenanceRequests.landlordId, user.id))
      .orderBy(sql`${maintenanceRequests.createdAt} DESC`)
      .limit(5);

    // Properties list
    const propertyList = await db
      .select({
        id: properties.id,
        name: properties.name,
        addressLine1: properties.address,
        city: properties.city,
        state: properties.state,
        zip: properties.zipCode,
        jurisdiction: properties.jurisdiction,
        unitCount: sql<number>`count(${units.id})::int`,
      })
      .from(properties)
      .leftJoin(units, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, user.id))
      .groupBy(properties.id)
      .orderBy(properties.createdAt);

    return NextResponse.json({
      role: user.role,
      userName: user.firstName ?? user.email,
      summary: {
        openMaintenance: maintCount?.count ?? 0,
        emergencyRequests: emergencyCount?.count ?? 0,
        totalProperties: propertyCount?.count ?? 0,
        totalUnits: unitCount?.count ?? 0,
        activeTenants: tenantCount?.count ?? 0,
        pendingApplications: 0,
        complianceDeadlinesSoon: 0,
        unreadMessages: 0,
      },
      recentRequests,
      properties: propertyList,
    });
  } catch (error) {
    console.error("Portal API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
