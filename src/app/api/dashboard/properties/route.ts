import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, properties, units } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

// GET — list properties for the authenticated user
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
      return NextResponse.json({ properties: [], message: "User not found." });
    }

    const rows = await db
      .select({
        id: properties.id,
        name: properties.name,
        address: properties.address,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        jurisdiction: properties.jurisdiction,
        propertyType: properties.propertyType,
        createdAt: properties.createdAt,
        unitCount: sql<number>`count(${units.id})::int`,
      })
      .from(properties)
      .leftJoin(units, eq(units.propertyId, properties.id))
      .where(eq(properties.ownerId, dbUser.id))
      .groupBy(properties.id)
      .orderBy(properties.createdAt);

    return NextResponse.json({ properties: rows });
  } catch (err) {
    console.error("Properties GET error:", err);
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 });
  }
}

// POST — create a new property with optional units
export async function POST(req: NextRequest) {
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
    const { name, address, city, state, zipCode, jurisdiction, propertyType, unitList } = body;

    if (!address || !jurisdiction) {
      return NextResponse.json({ error: "Address and jurisdiction are required" }, { status: 400 });
    }

    // Insert property
    const [newProperty] = await db
      .insert(properties)
      .values({
        ownerId: dbUser.id,
        name: name || null,
        address,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        jurisdiction,
        propertyType: propertyType || "residential",
      })
      .returning();

    // Insert units if provided
    let createdUnits: typeof units.$inferSelect[] = [];
    if (unitList && Array.isArray(unitList) && unitList.length > 0) {
      createdUnits = await db
        .insert(units)
        .values(
          unitList.map((u: {
            identifier: string;
            bedrooms?: number;
            bathrooms?: string;
            squareFeet?: number;
            rentAmount?: string;
            isVoucherUnit?: boolean;
          }) => ({
            propertyId: newProperty.id,
            identifier: u.identifier || "Unit 1",
            bedrooms: u.bedrooms ?? null,
            bathrooms: u.bathrooms ?? null,
            squareFeet: u.squareFeet ?? null,
            rentAmount: u.rentAmount ?? null,
            isVoucherUnit: u.isVoucherUnit ?? false,
          }))
        )
        .returning();
    }

    return NextResponse.json({
      property: newProperty,
      units: createdUnits,
    });
  } catch (err) {
    console.error("Properties POST error:", err);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}

// PUT — update a property
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
    const { id, name, address, city, state, zipCode, jurisdiction, propertyType } = body;

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, dbUser.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(properties)
      .set({
        name: name !== undefined ? (name || null) : existing.name,
        address: address || existing.address,
        city: city !== undefined ? (city || null) : existing.city,
        state: state !== undefined ? (state || null) : existing.state,
        zipCode: zipCode !== undefined ? (zipCode || null) : existing.zipCode,
        jurisdiction: jurisdiction || existing.jurisdiction,
        propertyType: propertyType || existing.propertyType,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json({ property: updated });
  } catch (err) {
    console.error("Properties PUT error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

// DELETE — delete a property (cascades to units)
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, dbUser.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await db.delete(properties).where(eq(properties.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Properties DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
