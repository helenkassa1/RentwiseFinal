import type { Metadata } from "next";
import { LandingPage } from "@/components/home/landing-page";

export const metadata: Metadata = {
  title: "RentWise — Is Your Lease Actually Legal? | AI Lease Review for DC & Maryland",
  description:
    "Upload any residential lease and get instant compliance analysis against DC and Maryland housing codes. Free for tenants. AI-powered lease review, Section 8 voucher navigation, and tenant rights tools.",
  keywords: [
    "property management",
    "DC landlord",
    "Maryland landlord",
    "Section 8",
    "lease review",
    "tenant rights",
    "PG County",
    "housing code compliance",
    "DCHA voucher",
    "HAPGC",
  ],
};

export default function HomePage() {
  return <LandingPage />;
}
