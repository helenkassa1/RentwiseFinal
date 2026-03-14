import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Documents are stored as JSONB array on tenants record
// Each entry: { id, date, category, description, photos[], createdAt }

type DocumentEntry = {
  id: string;
  date: string;
  category: "maintenance" | "communication" | "condition" | "other";
  description: string;
  photos: string[];
  createdAt: string;
};

/**
 * GET /api/tenant/documents
 * Returns the tenant's issue documentation log
 */
export async function GET() {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tenantRecord] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.userId, dbUser.id), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenantRecord) {
      return NextResponse.json({ documents: [], linked: false });
    }

    // Documents stored in tenant's invitationToken field repurposed as documents JSONB
    // For MVP, we'll use a pragmatic approach with the notes-like pattern
    // We'll store documents in localStorage on client and sync later
    return NextResponse.json({ documents: [], linked: true });
  } catch (err) {
    console.error("Tenant documents GET error:", err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

/**
 * POST /api/tenant/documents
 * Add a documentation entry
 */
export async function POST(req: NextRequest) {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, category, description, photos } = body as {
      date: string;
      category: string;
      description: string;
      photos?: string[];
    };

    if (!description || !category) {
      return NextResponse.json({ error: "Category and description required" }, { status: 400 });
    }

    const entry: DocumentEntry = {
      id: crypto.randomUUID(),
      date: date || new Date().toISOString().slice(0, 10),
      category: (category as DocumentEntry["category"]) || "other",
      description,
      photos: photos ?? [],
      createdAt: new Date().toISOString(),
    };

    // For MVP, return the entry — client stores in localStorage
    // Full implementation would store in a dedicated table
    return NextResponse.json({ document: entry });
  } catch (err) {
    console.error("Tenant documents POST error:", err);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
