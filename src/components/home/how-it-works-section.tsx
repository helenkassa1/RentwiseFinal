"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HowItWorksSection() {
  const handleAccordionChange = (value: string) => {
    if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p: { section: string }) => void } }).posthog) {
      (window as unknown as { posthog: { capture: (e: string, p: { section: string }) => void } }).posthog.capture("accordion_expanded", {
        section: value,
      });
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">How it works</h2>

      <Accordion
        type="single"
        collapsible
        className="max-w-3xl mx-auto"
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value="landlords">
          <AccordionTrigger className="text-lg font-semibold">
            ▶ For Landlords (1-10 properties)
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-4 mt-4">
              <li>
                <strong>1. Upload your lease</strong> → Get compliance report in 2 minutes
              </li>
              <li>
                <strong>2. Track deadlines</strong> → Security deposits, repairs, rent increases
              </li>
              <li>
                <strong>3. Navigate Section 8</strong> → DCHA/HAPGC workflows & HQS checklists
              </li>
              <li>
                <strong>4. Stay compliant</strong> → Jurisdiction-specific alerts (DC/MD/PG County)
              </li>
            </ol>
            <Button asChild className="mt-6 w-full">
              <Link href="/signup?type=landlord">Create Landlord Account →</Link>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="property-managers">
          <AccordionTrigger className="text-lg font-semibold">
            ▶ For Property Managers (Up to 100 properties)
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-4 mt-4">
              <li>
                <strong>1. Organize by client</strong> → Separate portfolios for each property owner
              </li>
              <li>
                <strong>2. Bulk lease review</strong> → Analyze multiple leases at once
              </li>
              <li>
                <strong>3. Client-specific billing</strong> → Track expenses per portfolio
              </li>
              <li>
                <strong>4. Centralized maintenance</strong> → All requests organized by client/property
              </li>
              <li>
                <strong>5. Team access controls</strong> → Assign staff to specific portfolios
              </li>
              <li>
                <strong>6. Navigate Section 8 at scale</strong> → Voucher workflows for multiple units
              </li>
              <li>
                <strong>7. Advanced reporting</strong> → Compliance dashboards per client
              </li>
            </ol>
            <Button asChild className="mt-6 w-full">
              <Link href="/signup?type=property-manager">Create Property Manager Account →</Link>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tenants">
          <AccordionTrigger className="text-lg font-semibold">
            ▶ For Tenants
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-4 mt-4">
              <li>
                <strong>1. Choose your issue</strong> → Repairs? Deposit? Eviction? Voucher?
              </li>
              <li>
                <strong>2. Get instant guidance</strong> → Know your rights in DC/MD/PG County
              </li>
              <li>
                <strong>3. Take action</strong> → Sample letters, documentation tips, next steps
              </li>
              <li>
                <strong>4. Submit requests</strong> → If your landlord uses RentWise
              </li>
            </ol>
            <Button asChild className="mt-6 w-full" variant="outline">
              <Link href="/signup?type=tenant">Create Free Tenant Account →</Link>
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
