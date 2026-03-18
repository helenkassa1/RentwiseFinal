"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AccessBanner } from "@/components/access-gate";
import { canAccessVoucher, type RentWiseUser } from "@/lib/usage";
import { MainNav } from "@/components/navigation/main-nav";

export default function VoucherNavigationPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const getRentWiseUser = (): RentWiseUser => {
    if (!isSignedIn || !user) return null;
    return {
      id: user.id,
      role:
        (user.publicMetadata?.role as "tenant" | "landlord" | "pm") ||
        "landlord",
      plan:
        (user.publicMetadata?.plan as "free" | "pro" | "pm") || "free",
    };
  };

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const rwUser = getRentWiseUser();
  const voucherAccess = canAccessVoucher(rwUser);

  // If not authenticated — show auth gate
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <AccessBanner
            reason="auth_required"
            feature="Section 8 Voucher Navigator"
          />
        </div>
      </div>
    );
  }

  // If tenant — redirect (this isn't a tenant tool)
  if (rwUser?.role === "tenant") {
    router.push("/tenant-rights");
    return null;
  }

  // If free plan — show upgrade prompt
  if (!voucherAccess.allowed && voucherAccess.reason === "plan_required") {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <AccessBanner
            reason="plan_required"
            feature="Section 8 Voucher Navigator"
          />

          {/* Preview of what they'd get */}
          <div className="mt-8 opacity-50 pointer-events-none select-none">
            <p className="text-xs text-slate-400 text-center mb-4 font-medium uppercase tracking-wider">
              Preview — upgrade to access
            </p>
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-3xl font-bold mb-4">
                Section 8 & Voucher Tools
              </h1>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Step-by-step DCHA and HAPGC workflows, HQS inspection prep,
                and HAP contract guidance. Available in the full platform for
                landlords and property managers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pro or PM — render the full page normally
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Section 8 & Voucher Tools
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Step-by-step DCHA and HAPGC workflows, HQS inspection prep, and HAP
          contract guidance. Available in the full platform for landlords and
          property managers.
        </p>
        <Button asChild>
          <Link href="/signup?type=landlord">
            Get Started for Landlords / PMs →
          </Link>
        </Button>
      </div>
    </div>
  );
}
