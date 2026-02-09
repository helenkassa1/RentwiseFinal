"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function VoucherCalloutSection() {
  return (
    <section className="bg-primary/5 py-12">
      <div className="container mx-auto px-4">
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          <AccordionItem value="voucher" className="border-none">
            <AccordionTrigger className="text-xl font-semibold hover:no-underline">
              ▶ Accepting Section 8 tenants? We make it simple.
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3 mt-4 text-base">
                <li>✓ DC & PG County prohibit source-of-income discrimination</li>
                <li>✓ Step-by-step DCHA and HAPGC workflows</li>
                <li>✓ HQS inspection prep (reduce failures by 80%)</li>
                <li>✓ HAP contract & payment timeline guidance</li>
              </ul>
              <Button asChild className="mt-6 w-full md:w-auto">
                <Link href="/voucher-navigation">Learn More About Voucher Tools →</Link>
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
