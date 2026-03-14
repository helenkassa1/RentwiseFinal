import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensure the currently authenticated Clerk user has a matching row in the
 * `users` table.  If the row doesn't exist yet it is created automatically
 * using the profile data Clerk already has (email, first/last name).
 *
 * @param role – optional DB role to assign when creating a new row.
 *               Ignored if the user already exists.
 * @returns the DB user row (or null when not authenticated)
 */
export async function ensureDbUser(
  role?: "private_landlord" | "small_pm" | "professional_pm" | "tenant" | "admin",
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  // Fast path — user already synced
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing) return existing;

  // Pull profile from Clerk so we can populate name/email
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@unknown.com`;

  const [newUser] = await db
    .insert(users)
    .values({
      clerkId,
      email,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      role: role ?? "private_landlord",
      onboardingCompleted: false,
    })
    .returning();

  return newUser;
}
