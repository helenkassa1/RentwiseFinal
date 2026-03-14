import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { tenants, maintenanceRequests, units, properties } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Legal response deadlines by jurisdiction + urgency
const LEGAL_DEADLINES: Record<string, Record<string, { hours: number; citation: string }>> = {
  dc: {
    emergency: { hours: 24, citation: "D.C. Code § 42-3505.01 — 24-hour response for emergencies" },
    urgent: { hours: 72, citation: "14 DCMR § 304 — 72 hours for urgent habitability issues" },
    routine: { hours: 336, citation: "14 DCMR § 304 — 14 days for routine repairs" }, // 14 days
  },
  maryland: {
    emergency: { hours: 24, citation: "MD Real Property § 8-211 — Reasonable time (24hrs for emergencies)" },
    urgent: { hours: 168, citation: "MD Real Property § 8-211 — Reasonable time (7 days for urgent)" },
    routine: { hours: 720, citation: "MD Real Property § 8-211 — 30 days for routine repairs" }, // 30 days
  },
  pg_county: {
    emergency: { hours: 24, citation: "PG County Code § 13-172 — 24-hour emergency response" },
    urgent: { hours: 168, citation: "PG County Code § 13-172 — 7 days for urgent repairs" },
    routine: { hours: 720, citation: "PG County Code § 13-172 — 30 days for routine repairs" },
  },
};

/**
 * GET /api/tenant/maintenance
 * List maintenance requests for the current tenant
 */
export async function GET() {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find tenant record
    const [tenantRecord] = await db
      .select({ id: tenants.id, unitId: tenants.unitId })
      .from(tenants)
      .where(and(eq(tenants.userId, dbUser.id), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenantRecord) {
      return NextResponse.json({ requests: [], linked: false });
    }

    // Get jurisdiction from unit → property
    const [unitInfo] = await db
      .select({ jurisdiction: properties.jurisdiction })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(units.id, tenantRecord.unitId))
      .limit(1);

    const jurisdiction = unitInfo?.jurisdiction ?? "dc";

    const requests = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.tenantId, tenantRecord.id))
      .orderBy(desc(maintenanceRequests.createdAt));

    // Enrich with legal timeline info
    const enriched = requests.map((r) => {
      const urgency = r.urgency ?? "routine";
      const deadlineInfo = LEGAL_DEADLINES[jurisdiction]?.[urgency] ?? LEGAL_DEADLINES.dc[urgency];
      const legalDeadline = r.legalDeadline
        ? new Date(r.legalDeadline)
        : deadlineInfo
          ? new Date(new Date(r.createdAt).getTime() + deadlineInfo.hours * 60 * 60 * 1000)
          : null;

      return {
        ...r,
        legalDeadlineDate: legalDeadline?.toISOString() ?? null,
        legalCitation: deadlineInfo?.citation ?? null,
        legalHours: deadlineInfo?.hours ?? null,
      };
    });

    return NextResponse.json({ requests: enriched, linked: true, jurisdiction });
  } catch (err) {
    console.error("Tenant maintenance GET error:", err);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

/**
 * POST /api/tenant/maintenance
 * Submit a new maintenance request
 */
export async function POST(req: NextRequest) {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tenantRecord] = await db
      .select({ id: tenants.id, unitId: tenants.unitId, landlordId: tenants.landlordId })
      .from(tenants)
      .where(and(eq(tenants.userId, dbUser.id), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenantRecord) {
      return NextResponse.json({ error: "No linked property. Claim a unit first." }, { status: 400 });
    }

    const body = await req.json();
    const { category, description, urgency, photos } = body as {
      category: string;
      description: string;
      urgency?: "emergency" | "urgent" | "routine";
      photos?: string[]; // base64 strings
    };

    if (!category || !description) {
      return NextResponse.json({ error: "Category and description are required" }, { status: 400 });
    }

    // Get jurisdiction for legal deadline
    const [unitInfo] = await db
      .select({ jurisdiction: properties.jurisdiction })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(units.id, tenantRecord.unitId))
      .limit(1);

    const jurisdiction = unitInfo?.jurisdiction ?? "dc";
    const urg = urgency ?? "routine";
    const deadlineInfo = LEGAL_DEADLINES[jurisdiction]?.[urg] ?? LEGAL_DEADLINES.dc[urg];
    const legalDeadline = deadlineInfo
      ? new Date(Date.now() + deadlineInfo.hours * 60 * 60 * 1000)
      : null;

    const [newRequest] = await db
      .insert(maintenanceRequests)
      .values({
        unitId: tenantRecord.unitId,
        tenantId: tenantRecord.id,
        landlordId: tenantRecord.landlordId,
        category,
        description,
        urgency: urg,
        photos: JSON.stringify(photos ?? []),
        status: "submitted",
        legalDeadline,
      })
      .returning();

    return NextResponse.json({
      request: {
        ...newRequest,
        legalDeadlineDate: legalDeadline?.toISOString() ?? null,
        legalCitation: deadlineInfo?.citation ?? null,
        legalHours: deadlineInfo?.hours ?? null,
      },
    });
  } catch (err) {
    console.error("Tenant maintenance POST error:", err);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
