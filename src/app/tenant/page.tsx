"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ArrowRight,
  MapPin,
  Loader2,
  Home,
  Building2,
  CreditCard,
  Wrench,
  Scale,
  FolderOpen,
  MessageSquare,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
  Shield,
} from "lucide-react";

const RIGHTS_LINKS = [
  { label: "Security deposits", href: "/tenant-rights?jurisdiction=dc#deposits" },
  { label: "Repairs & habitability", href: "/tenant-rights?jurisdiction=dc#repairs" },
  { label: "Entry & privacy", href: "/tenant-rights?jurisdiction=dc#entry" },
];

type HomeData = {
  linked: boolean;
  tenant?: {
    id: string;
    name: string | null;
    moveInDate: string | null;
    isActive: boolean;
  };
  unit?: {
    unitIdentifier: string;
    bedrooms: number | null;
    bathrooms: string | null;
    squareFeet: number | null;
    rentAmount: string | null;
    propertyName: string | null;
    propertyAddress: string;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    jurisdiction: string;
  };
  lease?: {
    id: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    rentAmount: string | null;
    securityDeposit: string | null;
  } | null;
};

type MaintenanceRequest = {
  id: string;
  category: string;
  status: string;
  urgency: string;
  createdAt: string;
};

export default function TenantHomePage() {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [latestRequests, setLatestRequests] = useState<MaintenanceRequest[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenant/my-home").then((r) => r.json()),
      fetch("/api/tenant/maintenance").then((r) => r.json()).catch(() => ({ requests: [] })),
      fetch("/api/tenant/notifications").then((r) => r.json()).catch(() => ({ notifications: [] })),
    ])
      .then(([home, maint, notifs]) => {
        setHomeData(home);
        const openReqs = (maint.requests ?? []).filter(
          (r: MaintenanceRequest) => r.status !== "completed" && r.status !== "tenant_confirmed",
        );
        setMaintenanceCount(openReqs.length);
        setLatestRequests((maint.requests ?? []).slice(0, 3));
        setUnreadNotifs(
          (notifs.notifications ?? []).filter((n: { isRead: boolean }) => !n.isRead).length,
        );
      })
      .catch(() => setHomeData({ linked: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not linked — prompt to claim address
  if (!homeData?.linked) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold">My Home</h1>
          <p className="text-muted-foreground">Welcome to your tenant portal.</p>
        </header>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center space-y-4">
            <MapPin className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-xl font-bold">Link your home</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect to your landlord&apos;s property to see your lease details, submit
              maintenance requests, and know your rights.
            </p>
            <Button asChild size="lg">
              <Link href="/onboarding">
                Find my property <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

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
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  // Linked — full dashboard
  const { unit, lease } = homeData;
  const rentAmount = lease?.rentAmount ?? unit?.rentAmount;
  const jurisdiction = unit?.jurisdiction ?? "dc";
  const fullAddress = unit
    ? `${unit.propertyAddress}${unit.city ? `, ${unit.city}` : ""}${unit.state ? `, ${unit.state}` : ""}`
    : "Your property";

  // Next rent due (1st of next month)
  const now = new Date();
  const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold">Welcome home</h1>
        <p className="text-muted-foreground">
          {fullAddress} · {unit?.unitIdentifier}
        </p>
      </header>

      {/* Key metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/tenant/payments">
          <Card className={`hover:border-primary/50 transition-colors ${daysUntilDue <= 5 ? "border-amber-200" : ""}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${daysUntilDue <= 5 ? "bg-amber-100" : "bg-primary/10"}`}>
                  <DollarSign className={`h-5 w-5 ${daysUntilDue <= 5 ? "text-amber-600" : "text-primary"}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rent Due</p>
                  <p className="font-bold">{rentAmount ? `$${Number(rentAmount).toLocaleString()}` : "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {daysUntilDue <= 5 ? `⚠️ ${daysUntilDue} days` : `${daysUntilDue} days`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/lease">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lease</p>
                  <p className="font-bold capitalize">{lease?.status ?? "No lease"}</p>
                  {lease?.endDate && (
                    <p className="text-xs text-muted-foreground">
                      Ends {new Date(lease.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/requests">
          <Card className={`hover:border-primary/50 transition-colors ${maintenanceCount > 0 ? "border-amber-200" : ""}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${maintenanceCount > 0 ? "bg-amber-100" : "bg-green-50"}`}>
                  <Wrench className={`h-5 w-5 ${maintenanceCount > 0 ? "text-amber-600" : "text-green-600"}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Requests</p>
                  <p className="font-bold">{maintenanceCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {maintenanceCount === 0 ? "All clear" : "In progress"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenant/messages">
          <Card className={`hover:border-primary/50 transition-colors ${unreadNotifs > 0 ? "border-primary/30" : ""}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2 ${unreadNotifs > 0 ? "bg-primary/10" : "bg-gray-100"}`}>
                  <MessageSquare className={`h-5 w-5 ${unreadNotifs > 0 ? "text-primary" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <p className="font-bold">{unreadNotifs > 0 ? `${unreadNotifs} unread` : "None"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/tenant/requests">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-4 text-center">
                <Wrench className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-medium">Submit Request</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenant/lease">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-4 text-center">
                <FileText className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-medium">Review Lease</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenant/rights">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-4 text-center">
                <Scale className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-medium">Know Your Rights</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenant/documents">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-4 text-center">
                <FolderOpen className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-medium">Log an Issue</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent maintenance requests */}
      {latestRequests.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Requests</h2>
            <Link href="/tenant/requests" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {latestRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{req.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.urgency === "emergency"
                          ? "bg-red-100 text-red-700"
                          : req.urgency === "urgent"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}>
                        {req.urgency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {req.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* RentWise AI Features */}
      <section>
        <h2 className="text-lg font-semibold mb-3">AI-Powered Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/tenant/rights">
            <Card className="hover:border-primary/50 transition-colors h-full bg-primary/5 border-primary/20">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold">Rights Assistant</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ask any question about your rights and get plain-English answers grounded in DC/MD law.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/lease-review">
            <Card className="hover:border-primary/50 transition-colors h-full bg-blue-50/50 border-blue-200/50">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-semibold">AI Lease Review</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload your lease and get AI-flagged issues with legal explanations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenant/escalation">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Escalation Guide</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Step-by-step process for filing complaints with DCRA or PG County.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tenant/documents">
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <FolderOpen className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Issue Documentation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Timestamped log with photos you can export if things escalate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Know your rights */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Know Your Rights</h2>
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {RIGHTS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href.replace("dc", jurisdiction === "pg_county" ? "pg" : "dc")}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/tenant-rights?jurisdiction=${jurisdiction === "pg_county" ? "pg" : "dc"}`}
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
