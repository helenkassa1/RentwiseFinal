import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { properties, units } from "@/lib/db/schema";
import { eq, ilike, and, sql } from "drizzle-orm";

/**
 * POST /api/tenant/search-property
 * Search for properties by address so a tenant can find & claim their unit.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { address, city, state, zipCode } = body as {
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };

    if (!address || address.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter at least 3 characters of your address." },
        { status: 400 },
      );
    }

    // Build WHERE conditions — address is required, others are optional filters
    const conditions = [ilike(properties.address, `%${address.trim()}%`)];
    if (city?.trim()) conditions.push(ilike(properties.city, `%${city.trim()}%`));
    if (state?.trim()) conditions.push(ilike(properties.state, `%${state.trim()}%`));
    if (zipCode?.trim()) conditions.push(eq(properties.zipCode, zipCode.trim()));

    // Fetch matching properties
    const matchedProperties = await db
      .select({
        id: properties.id,
        name: properties.name,
        address: properties.address,
        city: properties.city,
        state: properties.state,
        zipCode: properties.zipCode,
        jurisdiction: properties.jurisdiction,
        propertyType: properties.propertyType,
      })
      .from(properties)
      .where(and(...conditions))
      .limit(20);

    if (matchedProperties.length === 0) {
      return NextResponse.json({ properties: [] });
    }

    // Fetch units for each matched property (only vacant ones available for claiming)
    const propertyIds = matchedProperties.map((p) => p.id);
    const availableUnits = await db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        identifier: units.identifier,
        bedrooms: units.bedrooms,
        bathrooms: units.bathrooms,
        squareFeet: units.squareFeet,
        rentAmount: units.rentAmount,
        status: units.status,
      })
      .from(units)
      .where(
        and(
          sql`${units.propertyId} IN (${sql.join(
            propertyIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
          eq(units.status, "vacant"),
        ),
      );

    // Group units by property
    const unitsByProperty = new Map<string, typeof availableUnits>();
    for (const unit of availableUnits) {
      const list = unitsByProperty.get(unit.propertyId) ?? [];
      list.push(unit);
      unitsByProperty.set(unit.propertyId, list);
    }

    const results = matchedProperties.map((p) => ({
      ...p,
      units: unitsByProperty.get(p.id) ?? [],
    }));

    return NextResponse.json({ properties: results });
  } catch (err) {
    console.error("Search property error:", err);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 },
    );
  }
}
