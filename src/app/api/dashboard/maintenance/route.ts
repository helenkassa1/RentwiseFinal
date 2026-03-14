import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, maintenanceRequests, units, properties, tenants } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/dashboard/maintenance
 * List all maintenance requests for properties owned by the logged-in landlord
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ requests: [] });
    }

    // Fetch all maintenance requests where landlordId = current user
    const rows = await db
      .select({
        id: maintenanceRequests.id,
        category: maintenanceRequests.category,
        description: maintenanceRequests.description,
        urgency: maintenanceRequests.urgency,
        status: maintenanceRequests.status,
        photos: maintenanceRequests.photos,
        legalDeadline: maintenanceRequests.legalDeadline,
        scheduledDate: maintenanceRequests.scheduledDate,
        completedDate: maintenanceRequests.completedDate,
        notes: maintenanceRequests.notes,
        createdAt: maintenanceRequests.createdAt,
        updatedAt: maintenanceRequests.updatedAt,
        // Unit info
        unitIdentifier: units.identifier,
        // Property info
        propertyAddress: properties.address,
        propertyName: properties.name,
        jurisdiction: properties.jurisdiction,
        // Tenant info
        tenantName: tenants.name,
        tenantEmail: tenants.email,
        tenantPhone: tenants.phone,
      })
      .from(maintenanceRequests)
      .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .innerJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
      .where(eq(maintenanceRequests.landlordId, dbUser.id))
      .orderBy(desc(maintenanceRequests.createdAt));

    return NextResponse.json({ requests: rows });
  } catch (err) {
    console.error("Dashboard maintenance GET error:", err);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

/**
 * PUT /api/dashboard/maintenance
 * Update a maintenance request status (landlord actions)
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, status, scheduledDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(maintenanceRequests)
      .where(and(eq(maintenanceRequests.id, id), eq(maintenanceRequests.landlordId, dbUser.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedDate = new Date();
      }
    }
    if (scheduledDate) {
      updateData.scheduledDate = new Date(scheduledDate);
    }
    if (notes !== undefined) {
      updateData.notes = JSON.stringify(notes);
    }

    const [updated] = await db
      .update(maintenanceRequests)
      .set(updateData)
      .where(eq(maintenanceRequests.id, id))
      .returning();

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("Dashboard maintenance PUT error:", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
