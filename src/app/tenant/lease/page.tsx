"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Scale, MessageSquare, Calendar, DollarSign, Loader2, Shield, ExternalLink } from "lucide-react";

type LeaseData = {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rentAmount: string | null;
  securityDeposit: string | null;
  leaseFileUrl: string | null;
  jurisdiction: string;
  complianceScore: number | null;
  reviewResults: unknown;
};

export default function TenantLeasePage() {
  const [loading, setLoading] = useState(true);
  const [linked, setLinked] = useState(false);
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [unitInfo, setUnitInfo] = useState<{ jurisdiction: string } | null>(null);

  useEffect(() => {
    fetch("/api/tenant/my-home")
      .then((res) => res.json())
      .then((data) => {
        setLinked(data.linked);
        if (data.lease) setLease(data.lease);
        if (data.unit) setUnitInfo({ jurisdiction: data.unit.jurisdiction });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const jurisdiction = unitInfo?.jurisdiction ?? "dc";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lease &amp; Rights</h1>

      {/* Lease Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Lease
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!linked ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Link your home first to see your lease details.
              </p>
              <Button asChild variant="outline" className="mt-3">
                <Link href="/onboarding">Link my home</Link>
              </Button>
            </div>
          ) : !lease ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                No lease on file yet. Your landlord can upload your lease, or you can review one yourself.
              </p>
              <Button asChild variant="outline">
                <Link href="/lease-review">
                  Upload &amp; review a lease <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lease summary cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{lease.status}</p>
                </div>
                {lease.rentAmount && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    </div>
                    <p className="font-semibold">${Number(lease.rentAmount).toLocaleString()}</p>
                  </div>
                )}
                {lease.startDate && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Start Date</p>
                    </div>
                    <p className="font-semibold">{new Date(lease.startDate).toLocaleDateString()}</p>
                  </div>
                )}
                {lease.endDate && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">End Date</p>
                    </div>
                    <p className="font-semibold">{new Date(lease.endDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Compliance Score */}
              {lease.complianceScore != null && (
                <div className={`rounded-lg p-4 ${
                  lease.complianceScore >= 80
                    ? "bg-green-50 border border-green-200"
                    : lease.complianceScore >= 50
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Compliance Score: {lease.complianceScore}/100</p>
                      <p className="text-xs text-muted-foreground">
                        {lease.complianceScore >= 80
                          ? "Your lease appears to be in good compliance with local regulations."
                          : lease.complianceScore >= 50
                            ? "Some issues were found that you should be aware of."
                            : "Several concerning issues were flagged in your lease."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {lease.leaseFileUrl && (
                  <Button asChild variant="outline">
                    <a href={lease.leaseFileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Lease
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/lease-review">
                    <Scale className="mr-2 h-4 w-4" />
                    AI Lease Review
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Rights Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ask About Your Lease
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Have questions about your lease terms? Get plain-English explanations grounded in{" "}
            {jurisdiction === "dc" ? "DC" : jurisdiction === "pg_county" ? "PG County" : "Maryland"} law.
          </p>
          <Button asChild>
            <Link href="/tenant/rights">
              Open Rights Assistant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Know Your Rights */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Know Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href={`/tenant-rights?jurisdiction=${jurisdiction}#deposits`} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">Security Deposits</p>
              <p className="text-xs text-muted-foreground">Limits, interest, return timelines</p>
            </Link>
            <Link href={`/tenant-rights?jurisdiction=${jurisdiction}#repairs`} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">Repairs &amp; Habitability</p>
              <p className="text-xs text-muted-foreground">Your right to a safe, livable home</p>
            </Link>
            <Link href={`/tenant-rights?jurisdiction=${jurisdiction}#entry`} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">Entry &amp; Privacy</p>
              <p className="text-xs text-muted-foreground">Notice requirements for landlord entry</p>
            </Link>
            <Link href={`/tenant-rights?jurisdiction=${jurisdiction}#eviction`} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <p className="font-medium text-sm">Eviction Protections</p>
              <p className="text-xs text-muted-foreground">Your rights in eviction proceedings</p>
            </Link>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/tenant-rights?jurisdiction=${jurisdiction}`}>
              View full rights library <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Escalation link */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Need to escalate an issue?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Learn how to file complaints with DCRA, PG County, or take legal action.
              </p>
              <Button asChild variant="link" className="h-auto p-0 mt-1 text-amber-700">
                <Link href="/tenant/escalation">
                  View escalation guide <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
