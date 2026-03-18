import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await request.json();

  // Validate role
  if (!["tenant", "landlord", "pm"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Update user metadata in Clerk
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      role: role,
      plan: "free", // Everyone starts on free
      onboardingComplete: true,
    },
  });

  return NextResponse.json({ success: true });
}
