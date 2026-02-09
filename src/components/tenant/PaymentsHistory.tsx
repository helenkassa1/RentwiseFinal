"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PaymentRecord } from "@/lib/tenant/types";

export function PaymentsHistory({ payments }: { payments: PaymentRecord[] }) {
  return (
    <section aria-labelledby="payments-history-heading">
      <h2 id="payments-history-heading" className="mb-3 text-lg font-semibold">
        Payment history
      </h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3">{p.date}</td>
                    <td className="p-3">${p.amount}</td>
                    <td className="p-3 capitalize">{p.type}</td>
                    <td className="p-3">
                      <span className={p.status === "paid" ? "text-green-600" : p.status === "late" ? "text-amber-600" : ""}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
