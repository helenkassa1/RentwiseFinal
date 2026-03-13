"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function ClerkRoot({
  publishableKey,
  children,
}: {
  publishableKey?: string;
  children: React.ReactNode;
}) {
  // Resolve key at runtime: prefer the prop, fall back to the env var
  const key = publishableKey || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  if (!key) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>;
}
