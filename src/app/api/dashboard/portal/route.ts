import { NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/auth/ensureDbUser";

export async function GET() {
  try {
    const user = await ensureDbUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      role: user.role,
      summary: {
        openMaintenance: 0,
        pendingApplications: 0,
        complianceDeadlinesSoon: 0,
        unreadMessages: 0,
      },
      properties: [],
    });
  } catch (error) {
    console.error("Portal API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
