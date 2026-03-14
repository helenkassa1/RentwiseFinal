"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  FileText,
  Wrench,
  MessageSquare,
  Scale,
  FolderOpen,
  Settings,
  Shield,
  Menu,
  X,
  Bell,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const navItems = [
  { href: "/tenant", label: "Home", icon: Home, description: "Dashboard overview" },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard, description: "Rent & payment history" },
  { href: "/tenant/lease", label: "Lease", icon: FileText, description: "Lease details & AI review" },
  { href: "/tenant/requests", label: "Requests", icon: Wrench, description: "Maintenance requests" },
  { href: "/tenant/rights", label: "Rights", icon: Scale, description: "Know your rights" },
  { href: "/tenant/documents", label: "Documents", icon: FolderOpen, description: "Issue documentation" },
  { href: "/tenant/messages", label: "Messages", icon: MessageSquare, description: "Notices & alerts" },
  { href: "/tenant/inspection", label: "Inspection", icon: ClipboardCheck, description: "Move-in/out checklist" },
  { href: "/tenant/escalation", label: "Escalation", icon: AlertTriangle, description: "File complaints" },
  { href: "/tenant/settings", label: "Settings", icon: Settings, description: "Preferences" },
];

export function TenantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden w-64 shrink-0 border-r bg-slate-50 lg:block">
        {/* Logo */}
        <Link
          href="/"
          className="flex h-16 items-center gap-2 border-b px-6 hover:opacity-90"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">RentWise</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4" aria-label="Tenant portal navigation">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/tenant" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto border-t p-4">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-semibold text-primary">Need help?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Chat with our AI Rights Assistant for instant answers.
            </p>
            <Link
              href="/tenant/rights"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              Open Assistant →
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8">
          {/* Mobile: logo + hamburger */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 lg:hidden hover:opacity-90"
            >
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold">RentWise</span>
            </Link>
            {/* Desktop: page context */}
            <div className="hidden lg:block" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/tenant/messages" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            {hasClerkKey ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-b bg-white">
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/tenant" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <div>
                      <span>{item.label}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
