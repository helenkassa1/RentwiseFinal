"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, DollarSign, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "late";
  method?: string;
};

export default function TenantPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [rentAmount, setRentAmount] = useState<number | null>(null);
  const [leaseEndDate, setLeaseEndDate] = useState<string | null>(null);

  // For MVP, payment records are stored locally
  const [payments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    fetch("/api/tenant/my-home")
      .then((res) => res.json())
      .then((data) => {
        if (data.unit?.rentAmount) setRentAmount(Number(data.unit.rentAmount));
        if (data.lease?.rentAmount) setRentAmount(Number(data.lease.rentAmount));
        if (data.lease?.endDate) setLeaseEndDate(data.lease.endDate);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Calculate next due date (1st of next month)
  const now = new Date();
  const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-primary" />
        Payments
      </h1>

      {/* Rent summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Rent</p>
                <p className="text-xl font-bold">
                  {rentAmount ? `$${rentAmount.toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={daysUntilDue <= 5 ? "border-amber-200" : ""}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2.5 ${daysUntilDue <= 5 ? "bg-amber-100" : "bg-blue-50"}`}>
                <Calendar className={`h-5 w-5 ${daysUntilDue <= 5 ? "text-amber-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Due Date</p>
                <p className="text-xl font-bold">{nextDue.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                <p className="text-xs text-muted-foreground">{daysUntilDue} days away</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lease Through</p>
                <p className="text-xl font-bold">
                  {leaseEndDate
                    ? new Date(leaseEndDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment tips */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="py-4 text-sm text-blue-800">
          <p className="font-medium">💡 Payment tips</p>
          <ul className="mt-2 space-y-1 text-xs list-disc pl-4">
            <li>Always get a receipt for cash or money order payments</li>
            <li>Keep records of all payments — screenshots, bank statements, receipts</li>
            <li>In DC, landlords must provide written receipts upon request (D.C. Code § 42-3505.31)</li>
            <li>Late fees cannot exceed 5% of monthly rent in DC</li>
          </ul>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No payment history recorded yet. Payment tracking will be available soon.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.method ?? "Payment"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${p.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : p.status === "late"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rights info */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Know your rent payment rights</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• Your landlord must accept at least one form of electronic payment (DC)</li>
                <li>• Landlords cannot charge late fees during the grace period</li>
                <li>• Rent increases require proper written notice (30-90 days depending on jurisdiction)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
