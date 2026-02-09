"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { Reminder } from "@/lib/tenant/reminders";
import type { Notice } from "@/lib/tenant/types";
import { Card, CardContent } from "@/components/ui/card";

const MAX_VISIBLE = 3;

export function AlertsPanel({
  reminders,
  notices,
}: {
  reminders: Reminder[];
  notices: Notice[];
}) {
  const unreadNotices = notices.filter((n) => !n.read);
  const alertItems = [
    ...reminders.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      severity: r.severity,
      href: r.type === "rent_due" ? "/tenant/payments" : "/tenant",
    })),
    ...unreadNotices.slice(0, 2).map((n) => ({
      id: n.id,
      title: n.title,
      description: n.body.slice(0, 80) + (n.body.length > 80 ? "…" : ""),
      severity: "info" as const,
      href: "/tenant/messages",
    })),
  ].slice(0, MAX_VISIBLE);
  const hasMore = reminders.length + unreadNotices.length > MAX_VISIBLE;

  if (alertItems.length === 0) return null;

  return (
    <section aria-labelledby="alerts-heading">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="alerts-heading" className="text-sm font-semibold">
          Alerts
        </h2>
        {hasMore && (
          <Link href="/tenant" className="text-xs text-primary hover:underline">
            See all
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {alertItems.map((item) => (
          <Link key={item.id} href={item.href}>
            <Card className={item.severity === "urgent" ? "border-amber-200 bg-amber-50/50" : ""}>
              <CardContent className="flex items-start gap-2 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
