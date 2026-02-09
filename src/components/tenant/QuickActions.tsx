"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Wrench, FileText } from "lucide-react";

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="sr-only">
        Quick actions
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <Link href="/tenant/payments">
          <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
            <CreditCard className="h-5 w-5" aria-hidden />
            Pay Rent
          </Button>
        </Link>
        <Link href="/tenant/requests">
          <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
            <Wrench className="h-5 w-5" aria-hidden />
            Request Repair
          </Button>
        </Link>
        <Link href="/tenant/lease">
          <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4">
            <FileText className="h-5 w-5" aria-hidden />
            Review Lease
          </Button>
        </Link>
      </div>
    </section>
  );
}
