import type { Metadata } from "next";
import { MainNav } from "@/components/navigation/main-nav";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { VoucherCalloutSection } from "@/components/home/voucher-callout-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { FinalCTASection } from "@/components/home/final-cta-section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RentWise - AI-Powered Property Management for DC & Maryland",
  description:
    "Stay compliant with DC, Maryland, and PG County housing laws. AI-powered lease review, Section 8 navigation, and tenant rights tools.",
  keywords: [
    "property management",
    "DC landlord",
    "Maryland landlord",
    "Section 8",
    "lease review",
    "tenant rights",
    "PG County",
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MainNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <VoucherCalloutSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">&copy; 2026 RentWise. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
