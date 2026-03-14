"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Wrench,
  Users,
  Home,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
  MapPin,
  Scale,
  Shield,
  Bell,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type Summary = {
  openMaintenance: number;
  emergencyRequests: number;
  totalProperties: number;
  totalUnits: number;
  activeTenants: number;
  pendingApplications: number;
  complianceDeadlinesSoon: number;
  unreadMessages: number;
};

type RecentRequest = {
  id: string;
  category: string;
  urgency: string;
  status: string;
  createdAt: string;
  unitIdentifier: string;
  propertyAddress: string;
  tenantName: string | null;
};

type Property = {
  id: string;
  name: string | null;
  addressLine1: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  jurisdiction: string;
  unitCount: number;
};

const URGENCY_STYLES: Record<string, string> = {
  emergency: "bg-red-100 text-red-700",
  urgent: "bg-amber-100 text-amber-700",
  routine: "bg-blue-100 text-blue-700",
};

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  acknowledged: "bg-purple-100 text-purple-700",
  scheduled: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

const jurisdictionLabels: Record<string, string> = {
  dc: "Washington D.C.",
  maryland: "Maryland",
  pg_county: "PG County",
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [propertyList, setPropertyList] = useState<Property[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/portal")
      .then((res) => res.json())
      .then((data) => {
        if (data.role === "tenant") {
          router.replace("/tenant");
          return;
        }
        setUserName(data.userName ?? "");
        setSummary(data.summary ?? null);
        setRecentRequests(data.recentRequests ?? []);
        setPropertyList(data.properties ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50 border border-primary/10 p-6">
        <h1 className="text-2xl font-bold">
          Welcome back{userName ? `, ${userName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/properties">
          <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {summary?.totalUnits ?? 0} units
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Properties</p>
              <p className="text-2xl font-bold mt-0.5">{summary?.totalProperties ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tenants">
          <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-green-100 p-2.5">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Active Tenants</p>
              <p className="text-2xl font-bold mt-0.5">{summary?.activeTenants ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/maintenance">
          <Card className={`hover:shadow-md transition-all cursor-pointer h-full ${(summary?.openMaintenance ?? 0) > 0 ? "border-amber-200 bg-amber-50/30" : "hover:border-primary/30"}`}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`rounded-xl p-2.5 ${(summary?.openMaintenance ?? 0) > 0 ? "bg-amber-100" : "bg-gray-100"}`}>
                  <Wrench className={`h-5 w-5 ${(summary?.openMaintenance ?? 0) > 0 ? "text-amber-600" : "text-gray-500"}`} />
                </div>
                {(summary?.emergencyRequests ?? 0) > 0 && (
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {summary?.emergencyRequests} emergency
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Open Requests</p>
              <p className="text-2xl font-bold mt-0.5">{summary?.openMaintenance ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leases">
          <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-purple-100 p-2.5">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Leases</p>
              <p className="text-lg font-bold mt-0.5">Manage Leases</p>
              <p className="text-xs text-muted-foreground mt-1">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI compliance check
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/dashboard/properties", icon: Plus, label: "Add\nProperty", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { href: "/lease-review", icon: FileText, label: "Review\nLease", color: "bg-purple-50 text-purple-600 border-purple-100" },
            { href: "/dashboard/maintenance", icon: Wrench, label: "View\nRequests", color: "bg-amber-50 text-amber-600 border-amber-100" },
            { href: "/dashboard/tenants", icon: Users, label: "Manage\nTenants", color: "bg-green-50 text-green-600 border-green-100" },
            { href: "/dashboard/inspections", icon: ClipboardCheck, label: "Run\nInspection", color: "bg-teal-50 text-teal-600 border-teal-100" },
            { href: "/tenant-rights", icon: Scale, label: "Legal\nReference", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className={`hover:shadow-md transition-all cursor-pointer h-full border ${action.color.split(" ").pop()}`}>
                <CardContent className="py-5 text-center">
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${action.color.split(" ").slice(0, 2).join(" ")}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium whitespace-pre-line leading-tight">
                    {action.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Two-column: Recent Requests + Properties ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                Recent Requests
              </CardTitle>
              <Link href="/dashboard/maintenance" className="text-xs text-primary hover:underline font-medium">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 mb-2 text-green-400" />
                <p className="text-sm font-medium">No maintenance requests</p>
                <p className="text-xs mt-1">All clear across your properties!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <Link key={req.id} href="/dashboard/maintenance">
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 rounded-full p-1.5 ${URGENCY_STYLES[req.urgency] ?? "bg-gray-100 text-gray-600"}`}>
                          {req.urgency === "emergency" ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <Wrench className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{req.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.tenantName ?? "Tenant"} · {req.unitIdentifier}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {req.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Your Properties
              </CardTitle>
              <Link href="/dashboard/properties" className="text-xs text-primary hover:underline font-medium">
                Manage →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {propertyList.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">No properties yet</p>
                <p className="text-xs mt-1">Add your first property to get started.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/dashboard/properties">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Property
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {propertyList.slice(0, 5).map((p) => (
                  <Link key={p.id} href="/dashboard/properties">
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">{p.name || p.addressLine1}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.city && p.state ? `${p.city}, ${p.state}` : p.addressLine1}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {jurisdictionLabels[p.jurisdiction] ?? p.jurisdiction}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {p.unitCount} {p.unitCount === 1 ? "unit" : "units"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── AI Tools ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">AI-Powered Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/lease-review">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full bg-gradient-to-br from-primary/5 to-blue-50/50 border-primary/20">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Lease Review</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload a lease — get compliance issues flagged with legal citations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tenant-rights">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full bg-blue-50/30 border-blue-200/50">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Legal Reference</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      DC &amp; MD landlord-tenant law — rights, obligations, and deadlines.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/inspections">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-teal-100 p-2">
                    <ClipboardCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Inspections</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage property inspections and condition reports.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
