import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  users,
  leases,
  units,
  properties,
  tenants,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export type LeaseRow = {
  id: string;
  unitId: string;
  tenantId: string | null;
  landlordId: string;
  jurisdiction: string;
  status: string;
  isVoucherLease: boolean;
  startDate: Date | string | null;
  endDate: Date | string | null;
  rentAmount: string | null;
  securityDeposit: string | null;
  leaseFileUrl: string | null;
  createdAt: Date | string;
  propertyAddress?: string;
  unitIdentifier?: string;
};

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
      return NextResponse.json({
        leases: [],
        role: null,
        message: "User not found in database. Complete onboarding first.",
      });
    }

    const isTenant = dbUser.role === "tenant";
    let leaseList: LeaseRow[] = [];

    if (isTenant) {
      const tenantRows = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.userId, dbUser.id));
      const tenantIds = tenantRows.map((t) => t.id);
      if (tenantIds.length === 0) {
        return NextResponse.json({
          leases: [],
          role: "tenant",
          message: "No lease linked to your account yet.",
        });
      }
      const tenantLeases = await db
        .select({
          id: leases.id,
          unitId: leases.unitId,
          tenantId: leases.tenantId,
          landlordId: leases.landlordId,
          jurisdiction: leases.jurisdiction,
          status: leases.status,
          isVoucherLease: leases.isVoucherLease,
          startDate: leases.startDate,
          endDate: leases.endDate,
          rentAmount: leases.rentAmount,
          securityDeposit: leases.securityDeposit,
          leaseFileUrl: leases.leaseFileUrl,
          createdAt: leases.createdAt,
          propertyAddress: properties.address,
          unitIdentifier: units.identifier,
        })
        .from(leases)
        .innerJoin(units, eq(leases.unitId, units.id))
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(inArray(leases.tenantId, tenantIds));
      leaseList = tenantLeases.map((r) => ({
        id: r.id,
        unitId: r.unitId,
        tenantId: r.tenantId,
        landlordId: r.landlordId,
        jurisdiction: r.jurisdiction,
        status: r.status,
        isVoucherLease: r.isVoucherLease,
        startDate: r.startDate,
        endDate: r.endDate,
        rentAmount: r.rentAmount,
        securityDeposit: r.securityDeposit,
        leaseFileUrl: r.leaseFileUrl,
        createdAt: r.createdAt,
        propertyAddress: r.propertyAddress ?? undefined,
        unitIdentifier: r.unitIdentifier ?? undefined,
      }));
    } else {
      const landlordLeases = await db
        .select({
          id: leases.id,
          unitId: leases.unitId,
          tenantId: leases.tenantId,
          landlordId: leases.landlordId,
          jurisdiction: leases.jurisdiction,
          status: leases.status,
          isVoucherLease: leases.isVoucherLease,
          startDate: leases.startDate,
          endDate: leases.endDate,
          rentAmount: leases.rentAmount,
          securityDeposit: leases.securityDeposit,
          leaseFileUrl: leases.leaseFileUrl,
          createdAt: leases.createdAt,
          propertyAddress: properties.address,
          unitIdentifier: units.identifier,
        })
        .from(leases)
        .innerJoin(units, eq(leases.unitId, units.id))
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(eq(leases.landlordId, dbUser.id));
      leaseList = landlordLeases.map((r) => ({
        id: r.id,
        unitId: r.unitId,
        tenantId: r.tenantId,
        landlordId: r.landlordId,
        jurisdiction: r.jurisdiction,
        status: r.status,
        isVoucherLease: r.isVoucherLease,
        startDate: r.startDate,
        endDate: r.endDate,
        rentAmount: r.rentAmount,
        securityDeposit: r.securityDeposit,
        leaseFileUrl: r.leaseFileUrl,
        createdAt: r.createdAt,
        propertyAddress: r.propertyAddress ?? undefined,
        unitIdentifier: r.unitIdentifier ?? undefined,
      }));
    }

    const role =
      dbUser.role === "tenant"
        ? "tenant"
        : dbUser.role === "professional_pm" || dbUser.role === "small_pm"
          ? "property_manager"
          : "landlord";

    return NextResponse.json({
      leases: leaseList,
      role,
    });
  } catch (err) {
    console.error("Leases API error:", err);
    return NextResponse.json(
      { error: "Failed to load leases" },
      { status: 500 }
    );
  }
}
