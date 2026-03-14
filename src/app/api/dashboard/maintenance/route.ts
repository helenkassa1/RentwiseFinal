import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  users,
  maintenanceRequests,
  units,
  properties,
  tenants,
  notifications,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Legal response deadlines by jurisdiction + urgency
const LEGAL_DEADLINES: Record<
  string,
  Record<
    string,
    {
      hours: number;
      citation: string;
      responseGuidance: string;
      requiredActions: string[];
    }
  >
> = {
  dc: {
    emergency: {
      hours: 24,
      citation: "D.C. Code § 42-3505.01",
      responseGuidance:
        "DC law requires landlords to respond to emergency maintenance within 24 hours. Failure to act may allow the tenant to withhold rent or pursue rent escrow through DC Superior Court.",
      requiredActions: [
        "Acknowledge the request in writing within 24 hours",
        "Arrange for emergency repair or temporary mitigation immediately",
        "If mold or lead: arrange professional inspection per 14 DCMR § 707",
        "Document all communications and actions taken",
        "Notify tenant of repair timeline and any temporary accommodations",
      ],
    },
    urgent: {
      hours: 72,
      citation: "14 DCMR § 304",
      responseGuidance:
        "Under DC housing code (14 DCMR § 304), urgent habitability issues must be addressed within 72 hours. This includes plumbing failures, heating/cooling outages, and security concerns.",
      requiredActions: [
        "Acknowledge the request in writing within 24 hours",
        "Schedule repair within 72 hours",
        "Provide tenant with expected repair date",
        "If repair will exceed 72 hours, document reason and provide interim solution",
      ],
    },
    routine: {
      hours: 336,
      citation: "14 DCMR § 304",
      responseGuidance:
        "Routine repairs must be completed within 14 days under DC housing regulations. Acknowledge receipt promptly and schedule the repair.",
      requiredActions: [
        "Acknowledge the request in writing",
        "Schedule repair within 14 days",
        "Notify tenant of scheduled repair date",
        "Complete repair and confirm with tenant",
      ],
    },
  },
  maryland: {
    emergency: {
      hours: 24,
      citation: "MD Real Property § 8-211",
      responseGuidance:
        "Maryland law (§ 8-211) requires landlords to act within a reasonable time for emergencies — generally interpreted as 24 hours. Tenant may pursue rent escrow through District Court if landlord fails to act.",
      requiredActions: [
        "Acknowledge the request in writing within 24 hours",
        "Dispatch emergency repair service immediately",
        "If hazardous conditions exist, provide alternative housing or mitigation",
        "Document all actions taken for compliance records",
        "Follow up with tenant on repair completion",
      ],
    },
    urgent: {
      hours: 168,
      citation: "MD Real Property § 8-211",
      responseGuidance:
        "Under MD Real Property § 8-211, urgent repairs must be addressed within a reasonable time — typically 7 days. Tenant has the right to petition for rent escrow if repairs are not made.",
      requiredActions: [
        "Acknowledge the request in writing within 48 hours",
        "Schedule repair within 7 days",
        "Provide tenant with expected repair date",
        "Complete repair and document resolution",
      ],
    },
    routine: {
      hours: 720,
      citation: "MD Real Property § 8-211",
      responseGuidance:
        "Routine repairs should be completed within 30 days under Maryland law. Maintain written communication with the tenant throughout the process.",
      requiredActions: [
        "Acknowledge the request in writing",
        "Schedule repair within 30 days",
        "Notify tenant of scheduled date",
        "Complete repair and confirm with tenant",
      ],
    },
  },
  pg_county: {
    emergency: {
      hours: 24,
      citation: "PG County Code § 13-172",
      responseGuidance:
        "Prince George's County Code § 13-172 requires 24-hour emergency response. DPIE (Dept. of Permitting, Inspections & Enforcement) can issue violations for non-compliance.",
      requiredActions: [
        "Acknowledge the request in writing within 24 hours",
        "Dispatch emergency repair immediately",
        "If habitability is affected, arrange temporary accommodations",
        "Report hazardous conditions to DPIE if required",
        "Document all communications and repair actions",
      ],
    },
    urgent: {
      hours: 168,
      citation: "PG County Code § 13-172",
      responseGuidance:
        "PG County Code § 13-172 requires urgent repairs within 7 days. DPIE can inspect and enforce compliance if tenant files a complaint.",
      requiredActions: [
        "Acknowledge the request in writing within 48 hours",
        "Schedule repair within 7 days",
        "Provide tenant with expected repair date",
        "Complete repair and document resolution",
      ],
    },
    routine: {
      hours: 720,
      citation: "PG County Code § 13-172",
      responseGuidance:
        "Routine repairs should be completed within 30 days under PG County code. Maintain written records of all communications.",
      requiredActions: [
        "Acknowledge the request in writing",
        "Schedule repair within 30 days",
        "Notify tenant of scheduled date",
        "Complete repair and confirm with tenant",
      ],
    },
  },
};

/**
 * GET /api/dashboard/maintenance
 * List all maintenance requests for properties owned by the logged-in landlord
 * Enriched with legal deadlines, citations, and response guidance
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
        tenantId: tenants.id,
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

    // Enrich with legal context
    const enriched = rows.map((r) => {
      const urgency = r.urgency ?? "routine";
      const jurisdiction = r.jurisdiction ?? "dc";
      const deadlineInfo =
        LEGAL_DEADLINES[jurisdiction]?.[urgency] ??
        LEGAL_DEADLINES.dc[urgency] ??
        LEGAL_DEADLINES.dc.routine;

      // Calculate deadline from createdAt if not stored
      const legalDeadlineDate = r.legalDeadline
        ? new Date(r.legalDeadline).toISOString()
        : new Date(
            new Date(r.createdAt).getTime() + deadlineInfo.hours * 60 * 60 * 1000
          ).toISOString();

      const hoursRemaining = Math.max(
        0,
        Math.floor(
          (new Date(legalDeadlineDate).getTime() - Date.now()) / (1000 * 60 * 60)
        )
      );

      const isOverdue = new Date(legalDeadlineDate) < new Date();

      return {
        ...r,
        // Legal enrichment
        legalDeadlineDate,
        legalCitation: deadlineInfo.citation,
        legalResponseHours: deadlineInfo.hours,
        legalResponseGuidance: deadlineInfo.responseGuidance,
        legalRequiredActions: deadlineInfo.requiredActions,
        legalHoursRemaining: hoursRemaining,
        legalIsOverdue: isOverdue && r.status !== "completed" && r.status !== "tenant_confirmed",
      };
    });

    return NextResponse.json({ requests: enriched });
  } catch (err) {
    console.error("Dashboard maintenance GET error:", err);
    return NextResponse.json(
      { error: "Failed to load requests" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboard/maintenance
 * Update a maintenance request status (landlord actions)
 * Optionally send acknowledgment message to tenant
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
    const { id, status, scheduledDate, notes, acknowledgmentMessage } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(maintenanceRequests)
      .where(
        and(
          eq(maintenanceRequests.id, id),
          eq(maintenanceRequests.landlordId, dbUser.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
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

    // If acknowledgment message provided, create a notification for the tenant
    if (acknowledgmentMessage && existing.tenantId) {
      // Look up tenant's userId
      const [tenantRecord] = await db
        .select({ userId: tenants.userId })
        .from(tenants)
        .where(eq(tenants.id, existing.tenantId))
        .limit(1);

      if (tenantRecord?.userId) {
        try {
          await db.insert(notifications).values({
            userId: tenantRecord.userId,
            type: "general",
            title: `Maintenance Update: ${existing.category}`,
            message: acknowledgmentMessage,
            metadata: JSON.stringify({
              maintenanceRequestId: id,
              status: status ?? existing.status,
              fromLandlord: true,
            }),
          });
        } catch (notifErr) {
          // Don't fail the whole request if notification insert fails
          console.error("Failed to create notification:", notifErr);
        }
      }
    }

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("Dashboard maintenance PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
