"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Calendar, Wallet, Wrench } from "lucide-react";
import type { TenantContext } from "@/lib/tenant/types";
import { nextRentDueDate } from "@/lib/tenant/reminders";

function nextDue(ctx: TenantContext): { date: string; label: string } {
  const next = nextRentDueDate(ctx, new Date());
  const date = next.toISOString().slice(0, 10);
  const label = next.getDate() === 1 ? date : `${date} (day ${next.getDate()})`;
  return { date, label };
}

export function SnapshotCards({ ctx }: { ctx: TenantContext }) {
  const rentDue = nextDue(ctx);
  const openRequests = ctx.requests.filter(
    (r) => r.status !== "completed"
  ).length;

  return (
    <section aria-labelledby="snapshot-heading">
      <h2 id="snapshot-heading" className="sr-only">
        Snapshot
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/tenant/payments">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">Next rent due</p>
                <p className="font-semibold">${ctx.rent.amount}</p>
                <p className="text-xs text-muted-foreground">{rentDue.label}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/lease">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Calendar className="h-8 w-8 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">Lease ends</p>
                <p className="font-semibold">{ctx.lease.endDate}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/payments">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Wallet className="h-8 w-8 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">Security deposit</p>
                <p className="font-semibold">${ctx.deposit.amount}</p>
                {ctx.deposit.bankName && (
                  <p className="text-xs text-muted-foreground">{ctx.deposit.bankName} {ctx.deposit.accountMasked}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenant/requests">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Wrench className="h-8 w-8 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">Open requests</p>
                <p className="font-semibold">{openRequests}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
