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
import { useState } from "react";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/* ── Nav links shared by both versions ── */
const navLinks = [
  { href: "/lease-review", label: "Lease Review Tool" },
  { href: "/tenant-rights", label: "Landlord/Tenant Rights Assistant" },
  { href: "/pricing", label: "Pricing" },
];

const signInOptions = [
  { href: "/sign-in?type=landlord", label: "\u{1F3E0} Landlord Sign In" },
  { href: "/sign-in?type=property-manager", label: "\u{1F3E2} Property Manager Sign In" },
  { href: "/sign-in?type=tenant", label: "\u{1F511} Tenant Sign In" },
];

/* ── Fallback nav when Clerk is not available (identical UI, no auth) ── */
function StaticNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Shield className="h-6 w-6" aria-hidden />
            RentWise
          </Link>
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Sign In <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {signInOptions.map((o) => (
                  <DropdownMenuItem key={o.href} asChild>
                    <Link href={o.href}>{o.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild size="sm">
              <Link href="/signup">Create Account</Link>
            </Button>
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
          <div className="md:hidden mt-4 flex flex-col gap-4 pb-4">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {signInOptions.map((o) => (
              <Link key={o.href} href={o.href} className="text-sm" onClick={() => setMobileMenuOpen(false)}>
                {o.label}
              </Link>
            ))}
            <Button asChild>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ── Full nav with Clerk auth ── */
function MainNavWithClerk() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Shield className="h-6 w-6" aria-hidden />
            RentWise
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}

            {!isSignedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      Sign In <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {signInOptions.map((o) => (
                      <DropdownMenuItem key={o.href} asChild>
                        <Link href={o.href}>{o.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Plan badge */}
                {user?.publicMetadata?.role === "tenant" && (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tenant
                  </span>
                )}
                {user?.publicMetadata?.role === "landlord" && user?.publicMetadata?.plan === "free" && (
                  <Link href="/pricing" className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                    Free Plan ↑
                  </Link>
                )}
                {user?.publicMetadata?.plan === "pro" && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                    Pro
                  </span>
                )}
                {user?.publicMetadata?.plan === "pm" && (
                  <span className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-200">
                    PM
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      {user?.firstName ?? "Account"} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
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
          <div className="md:hidden mt-4 flex flex-col gap-4 pb-4">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {!isSignedIn ? (
              <>
                {signInOptions.map((o) => (
                  <Link key={o.href} href={o.href} className="text-sm" onClick={() => setMobileMenuOpen(false)}>
                    {o.label}
                  </Link>
                ))}
                <Button asChild>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <SignOutButton>
                  <button className="text-sm text-left">Sign Out</button>
                </SignOutButton>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export function MainNav() {
  if (!hasClerkKey) {
    return <StaticNav />;
  }
  return <MainNavWithClerk />;
}
