"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// PRESERVED: All nav link destinations unchanged
const navLinks = [
  { href: "/lease-review", label: "Lease Review Tool" },
  { href: "/tenant-rights", label: "Rights Assistant" },
  { href: "/pricing", label: "Pricing" },
];

// PRESERVED: All sign-in option destinations unchanged
const signInOptions = [
  { href: "/sign-in?type=landlord", label: "\u{1F3E0} Landlord Sign In" },
  { href: "/sign-in?type=property-manager", label: "\u{1F3E2} Property Manager Sign In" },
  { href: "/sign-in?type=tenant", label: "\u{1F511} Tenant Sign In" },
];

/* ── Fallback nav when Clerk is not available ── */
function StaticNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Shield className="h-5 w-5 text-navy" aria-hidden />
          RentWise
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {l.label}
            </Link>
          ))}
          {/* PRESERVED: Sign In dropdown with all sign-in options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                Sign In <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {signInOptions.map((o) => (
                <DropdownMenuItem key={o.href} asChild>
                  <Link href={o.href}>{o.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* PRESERVED: /signup destination */}
          <Link href="/signup" className="bg-navy hover:bg-navy-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Get Started Free
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 border-t border-slate-100 pt-3">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {signInOptions.map((o) => (
            <Link key={o.href} href={o.href} className="text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>
              {o.label}
            </Link>
          ))}
          <Link href="/signup" className="bg-navy text-white px-4 py-2.5 rounded-lg text-sm font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}

/* ── Full nav with Clerk auth ── */
function MainNavWithClerk() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  // PRESERVED: Tenant role detection and routing
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/dashboard/portal")
      .then((res) => res.json())
      .then((data) => {
        if (data.role === "tenant") {
          setDashboardHref("/tenant");
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Shield className="h-5 w-5 text-navy" aria-hidden />
          RentWise
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {l.label}
            </Link>
          ))}

          {!isSignedIn ? (
            <>
              {/* PRESERVED: Sign In dropdown with all sign-in option hrefs */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                    Sign In <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {signInOptions.map((o) => (
                    <DropdownMenuItem key={o.href} asChild>
                      <Link href={o.href}>{o.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* PRESERVED: /signup destination */}
              <Link href="/signup" className="bg-navy hover:bg-navy-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                Get Started Free
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* PRESERVED: User dropdown with Dashboard link and SignOut */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                    {user?.firstName ?? "Account"} <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <button className="w-full text-left">Sign Out</button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 border-t border-slate-100 pt-3">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {!isSignedIn ? (
            <>
              {signInOptions.map((o) => (
                <Link key={o.href} href={o.href} className="text-sm text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                  {o.label}
                </Link>
              ))}
              <Link href="/signup" className="bg-navy text-white px-4 py-2.5 rounded-lg text-sm font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                Get Started Free
              </Link>
            </>
          ) : (
            <>
              <Link href={dashboardHref} className="text-sm text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <SignOutButton>
                <button className="text-sm text-left text-slate-600">Sign Out</button>
              </SignOutButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export function MainNav() {
  if (!hasClerkKey) {
    return <StaticNav />;
  }
  return <MainNavWithClerk />;
}
