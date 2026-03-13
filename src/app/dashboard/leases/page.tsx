"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle } from "lucide-react";
import { format } from "date-fns";

type LeaseItem = {
  id: string;
  unitId: string;
  tenantId: string | null;
  landlordId: string;
  jurisdiction: string;
  status: string;
  isVoucherLease: boolean;
  startDate: string | null;
  endDate: string | null;
  rentAmount: string | null;
  securityDeposit: string | null;
  leaseFileUrl: string | null;
  createdAt: string;
  propertyAddress?: string;
  unitIdentifier?: string;
};

type ApiResponse = {
  leases: LeaseItem[];
  role: string | null;
  message?: string;
};

const jurisdictionLabel: Record<string, string> = {
  dc: "Washington, D.C.",
  maryland: "Maryland",
  pg_county: "Prince George's County",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
};

export default function DashboardLeasesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/leases")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load leases");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Leases</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Leases</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTenant = data?.role === "tenant";
  const title = isTenant ? "My lease" : "Leases";
  const leases = data?.leases ?? [];
  const message = data?.message;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {!isTenant && (
          <Button asChild>
            <Link href="/lease-review">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create / review lease
            </Link>
          </Button>
        )}
      </div>

      {message && (
        <Card className="border-muted-foreground/30">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{message}</p>
            {message.includes("onboarding") && (
              <Button asChild className="mt-4">
                <Link href="/onboarding">Go to onboarding</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {leases.length === 0 && !message && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-center font-medium">No leases yet</p>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {isTenant
                ? "Your lease will appear here once your landlord adds you to a unit."
                : "Create a lease from the lease review tool or add a lease to a unit."}
            </p>
            {!isTenant && (
              <Button asChild className="mt-6">
                <Link href="/lease-review">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create / review lease
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {leases.length > 0 && (
        <div className="space-y-4">
          {leases.map((lease) => {
            const start = lease.startDate ? format(new Date(lease.startDate), "MMM d, yyyy") : "—";
            const end = lease.endDate ? format(new Date(lease.endDate), "MMM d, yyyy") : "—";
            const rent = lease.rentAmount != null ? `$${Number(lease.rentAmount).toLocaleString()}` : "—";
            return (
              <Card key={lease.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      {lease.propertyAddress ?? "Property"} {lease.unitIdentifier ? `· ${lease.unitIdentifier}` : ""}
                    </CardTitle>
                    <span className="rounded-full border px-3 py-1 text-xs font-medium">
                      {statusLabel[lease.status] ?? lease.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {jurisdictionLabel[lease.jurisdiction] ?? lease.jurisdiction}
                    {lease.isVoucherLease && " · Voucher lease"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">Start</span>
                      <p className="font-medium">{start}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End</span>
                      <p className="font-medium">{end}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rent</span>
                      <p className="font-medium">{rent}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lease-review?leaseId=${lease.id}`}>Review lease</Link>
                    </Button>
                    {lease.leaseFileUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={lease.leaseFileUrl} target="_blank" rel="noopener noreferrer">
                          View file
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
