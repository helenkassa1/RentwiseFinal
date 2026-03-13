"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function ClerkRoot({
  publishableKey,
  children,
}: {
  publishableKey: string;
  children: React.ReactNode;
}) {
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
