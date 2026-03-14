import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, properties, units } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/** Helper: verify the authenticated user owns the given property */
async function verifyOwnership(propertyId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  if (!dbUser) return null;

  const [prop] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, dbUser.id)))
    .limit(1);

  return prop ? dbUser : null;
}

// GET — list units for a property
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    const owner = await verifyOwnership(propertyId);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(units)
      .where(eq(units.propertyId, propertyId))
      .orderBy(units.identifier);

    return NextResponse.json({ units: rows });
  } catch (err) {
    console.error("Units GET error:", err);
    return NextResponse.json({ error: "Failed to load units" }, { status: 500 });
  }
}

// POST — add a new unit to a property
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, identifier, bedrooms, bathrooms, squareFeet, rentAmount, isVoucherUnit } = body;

    if (!propertyId || !identifier) {
      return NextResponse.json({ error: "propertyId and identifier are required" }, { status: 400 });
    }

    const owner = await verifyOwnership(propertyId);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [newUnit] = await db
      .insert(units)
      .values({
        propertyId,
        identifier,
        bedrooms: bedrooms ?? null,
        bathrooms: bathrooms ?? null,
        squareFeet: squareFeet ?? null,
        rentAmount: rentAmount ?? null,
        isVoucherUnit: isVoucherUnit ?? false,
      })
      .returning();

    return NextResponse.json({ unit: newUnit });
  } catch (err) {
    console.error("Units POST error:", err);
    return NextResponse.json({ error: "Failed to add unit" }, { status: 500 });
  }
}

// PUT — update an existing unit
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, identifier, bedrooms, bathrooms, squareFeet, rentAmount, isVoucherUnit } = body;

    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }

    // Get the unit to find its property
    const [existing] = await db
      .select()
      .from(units)
      .where(eq(units.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const owner = await verifyOwnership(existing.propertyId);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [updated] = await db
      .update(units)
      .set({
        identifier: identifier ?? existing.identifier,
        bedrooms: bedrooms !== undefined ? bedrooms : existing.bedrooms,
        bathrooms: bathrooms !== undefined ? bathrooms : existing.bathrooms,
        squareFeet: squareFeet !== undefined ? squareFeet : existing.squareFeet,
        rentAmount: rentAmount !== undefined ? rentAmount : existing.rentAmount,
        isVoucherUnit: isVoucherUnit !== undefined ? isVoucherUnit : existing.isVoucherUnit,
        updatedAt: new Date(),
      })
      .where(eq(units.id, id))
      .returning();

    return NextResponse.json({ unit: updated });
  } catch (err) {
    console.error("Units PUT error:", err);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

// DELETE — remove a unit
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(units)
      .where(eq(units.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const owner = await verifyOwnership(existing.propertyId);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(units).where(eq(units.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Units DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}
