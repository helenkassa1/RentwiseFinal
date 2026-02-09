"use client";

import Link from "next/link";
import { MOCK_TENANT_CONTEXT } from "@/lib/tenant/mockData";
import { computeReminders } from "@/lib/tenant/reminders";
import { AlertsPanel } from "@/components/tenant/AlertsPanel";
import { QuickActions } from "@/components/tenant/QuickActions";
import { SnapshotCards } from "@/components/tenant/SnapshotCards";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";

const RIGHTS_LINKS = [
  { label: "Security deposits", href: "/tenant-rights?jurisdiction=dc#deposits" },
  { label: "Repairs & habitability", href: "/tenant-rights?jurisdiction=dc#repairs" },
  { label: "Entry & privacy", href: "/tenant-rights?jurisdiction=dc#entry" },
];

// TODO: Replace mock with real tenant context from DB; wire invite linking (tenant ↔ unit/landlord).
export default function TenantHomePage() {
  const ctx = MOCK_TENANT_CONTEXT;
  const reminders = computeReminders(ctx);

  // Recent activity: last 2 payments, latest request update, latest notice
  const recentPayments = ctx.payments.slice(-2).reverse();
  const latestRequest = ctx.requests[0];
  const recentNotices = ctx.notices.slice(0, 2);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">My Home</h1>
        <p className="text-muted-foreground">
          {ctx.propertyAddress} · {ctx.unitLabel}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Rent ${ctx.rent.amount} due monthly · Lease ends {ctx.lease.endDate}
        </p>
      </header>

      <AlertsPanel reminders={reminders} notices={ctx.notices} />
      <QuickActions />
      <SnapshotCards ctx={ctx} />

      <section aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="mb-3 text-lg font-semibold">
          Recent activity
        </h2>
        <Card>
          <CardContent className="divide-y py-0">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <span className="text-sm">Payment · ${p.amount} · {p.note ?? p.date}</span>
                <span className="text-xs text-muted-foreground">{p.status}</span>
              </div>
            ))}
            {latestRequest && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm">Request: {latestRequest.subject}</span>
                <Link href="/tenant/requests" className="text-xs text-primary hover:underline">
                  View
                </Link>
              </div>
            )}
            {recentNotices.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-3">
                <span className="text-sm">{n.title}</span>
                <Link href="/tenant/messages" className="text-xs text-primary hover:underline">
                  View
                </Link>
              </div>
            ))}
            {recentPayments.length === 0 && !latestRequest && recentNotices.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="rights-heading">
        <h2 id="rights-heading" className="mb-3 text-lg font-semibold">
          Know your rights
        </h2>
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {RIGHTS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/tenant-rights?jurisdiction=${ctx.jurisdiction}`}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View full library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
