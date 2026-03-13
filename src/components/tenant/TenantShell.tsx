"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, FileText, Wrench, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const navItems = [
  { href: "/tenant", label: "Home", icon: Home },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/tenant/lease", label: "Lease & Rights", icon: FileText },
  { href: "/tenant/requests", label: "Requests", icon: Wrench },
  { href: "/tenant/messages", label: "Messages", icon: MessageSquare },
];

export function TenantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/tenant" className="font-semibold text-foreground">
            My Home
          </Link>
          <nav className="flex items-center gap-1" aria-label="Tenant portal navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/tenant" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {hasClerkKey ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
