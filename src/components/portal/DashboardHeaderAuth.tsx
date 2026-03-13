"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const hasClerkKey =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim() !== "";

export function DashboardHeaderAuth() {
  if (!hasClerkKey) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Sign In
      </Link>
    );
  }
  return <UserButton afterSignOutUrl="/" />;
}
