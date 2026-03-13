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


function MainNavInner() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Shield className="h-7 w-7" aria-hidden />
            RentWise
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/lease-review" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Lease Review Tool
            </Link>
            <Link href="/tenant-rights" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Landlord/Tenant Rights Assistant
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>

            {!isSignedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      Sign In <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in?type=landlord">🏠 Landlord Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in?type=property-manager">🏢 Property Manager Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sign-in?type=tenant">🔑 Tenant Sign In</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
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
            <Link href="/lease-review" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Lease Review Tool
            </Link>
            <Link href="/tenant-rights" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Landlord/Tenant Rights Assistant
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            {!isSignedIn ? (
              <>
                <Link href="/sign-in?type=landlord" className="text-sm" onClick={() => setMobileMenuOpen(false)}>🏠 Landlord Sign In</Link>
                <Link href="/sign-in?type=property-manager" className="text-sm" onClick={() => setMobileMenuOpen(false)}>🏢 Property Manager Sign In</Link>
                <Link href="/sign-in?type=tenant" className="text-sm" onClick={() => setMobileMenuOpen(false)}>🔑 Tenant Sign In</Link>
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
  return <MainNavInner />;
}
