"use client";

import { UserButton } from "@clerk/nextjs";

export function DashboardHeaderAuth() {
  return <UserButton afterSignOutUrl="/" />;
}
