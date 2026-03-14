"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal/PortalHeader";
import {
  getPropertyAttentionStatus,
  attentionLabel,
} from "@/lib/portal/attention";
import type { UserRole, PortalProperty } from "@/lib/portal/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Wrench, Search } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("landlord");
  const [summary, setSummary] = useState<{
    openMaintenance: number;
    pendingApplications: number;
    complianceDeadlinesSoon: number;
    unreadMessages: number;
  } | null>(null);
  const [properties, setProperties] = useState<PortalProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/portal")
      .then((res) => res.json())
      .then((data) => {
        // Redirect tenants to their own portal
        if (data.role === "tenant") {
          router.replace("/tenant");
          return;
        }
        if (data.role) setRole(data.role);
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.properties)) setProperties(data.properties);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const computed = useMemo(() => {
    const withStatus = properties.map((p) => ({
      ...p,
      status: getPropertyAttentionStatus(p),
    }));
    const urgent = withStatus.filter((p) => p.status === "urgent").length;
    const attention = withStatus.filter((p) => p.status === "attention").length;
    const filtered =
      searchQuery.trim() === ""
        ? withStatus
        : withStatus.filter(
            (p) =>
              p.addressLine1.toLowerCase().includes(searchQuery.toLowerCase()) ||
              [p.city, p.state, p.zip].some((s) =>
                s.toLowerCase().includes(searchQuery.toLowerCase())
              )
          );
    return { urgent, attention, filtered };
  }, [properties, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortalHeader
        role={role}
        canSwitchRoles
        onSwitchRole={(r) => setRole(r)}
      />

      {/* Global search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-muted-foreground" />
            Search
          </div>
          <input
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Search properties, tenants, tickets…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Needs Attention */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">Needs attention</div>
              <div className="text-sm text-muted-foreground">
                Prioritized items across your portfolio.
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full border px-3 py-1 text-xs">
                {computed.urgent} urgent
              </span>
              <span className="rounded-full border px-3 py-1 text-xs">
                {computed.attention} needs attention
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Open maintenance
              </div>
              <div className="text-xl font-bold">
                {summary?.openMaintenance ?? 0}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Pending applications
              </div>
              <div className="text-xl font-bold">
                {summary?.pendingApplications ?? 0}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Compliance deadlines
              </div>
              <div className="text-xl font-bold">
                {summary?.complianceDeadlinesSoon ?? 0}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Unread messages
              </div>
              <div className="text-xl font-bold">
                {summary?.unreadMessages ?? 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions + What's new */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">Quick actions</div>
            <div className="mt-3 grid gap-2">
              <Link href="/dashboard/properties">
                <button className="w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50">
                  <div className="font-semibold">+ Add property</div>
                  <div className="text-xs text-muted-foreground">
                    Register a new property
                  </div>
                </button>
              </Link>
              <Link href="/lease-review">
                <button className="w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50">
                  <div className="font-semibold">Create / review lease</div>
                  <div className="text-xs text-muted-foreground">
                    Generate or check compliance
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/properties">
                <button className="w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50">
                  <div className="font-semibold">Find a licensed vendor</div>
                  <div className="text-xs text-muted-foreground">
                    Open a property → Vendors tab
                  </div>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">What&apos;s new</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Tip: Click a property to open the{" "}
              <b>Command Center</b> (maintenance, compliance, applications,
              messages).
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {computed.filtered.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/properties/${p.id}`}
                  className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="font-semibold">{p.addressLine1}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.city}, {p.state} {p.zip}
                    </div>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    {p.status === "urgent"
                      ? "Urgent"
                      : p.status === "attention"
                        ? "Needs attention"
                        : "Healthy"}
                  </span>
                </Link>
              ))}
              {computed.filtered.length === 0 && (
                <p className="py-4 text-center text-muted-foreground">
                  No properties yet. Add your first property to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
