"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LeaseSummary as LeaseSummaryType } from "@/lib/tenant/types";

export function LeaseSummary({ summary }: { summary: LeaseSummaryType }) {
  return (
    <section aria-labelledby="lease-summary-heading">
      <h2 id="lease-summary-heading" className="mb-3 text-lg font-semibold">
        Lease in plain English
      </h2>
      <Card>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {summary.plainEnglishSummary.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {line}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
