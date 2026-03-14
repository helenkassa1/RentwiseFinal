import { NextRequest, NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/tenant/notifications
 * Returns notices/notifications for the tenant
 */
export async function GET() {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notices = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, dbUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json({
      notifications: notices,
      preferences: dbUser.notificationPreferences,
    });
  } catch (err) {
    console.error("Tenant notifications GET error:", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

/**
 * PUT /api/tenant/notifications
 * Update notification preferences or mark notifications as read
 */
export async function PUT(req: NextRequest) {
  try {
    const dbUser = await ensureDbUser("tenant");
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Mark notification as read
    if (body.markRead && typeof body.notificationId === "string") {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, body.notificationId));
      return NextResponse.json({ success: true });
    }

    // Update preferences
    if (body.preferences) {
      await db
        .update(users)
        .set({
          notificationPreferences: JSON.stringify(body.preferences),
          updatedAt: new Date(),
        })
        .where(eq(users.id, dbUser.id));
      return NextResponse.json({ success: true, preferences: body.preferences });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("Tenant notifications PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
