"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ClipboardCheck,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ExternalLink,
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
      <div className="space-y-8 max-w-2xl mx-auto">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to RentWise</h1>
          <p className="text-muted-foreground mt-2">Your tenant portal for managing your rental experience.</p>
        </header>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50/50">
          <CardContent className="py-10 text-center space-y-4">
            <MapPin className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-xl font-bold">Link your home to get started</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect to your landlord&apos;s property to see your lease details, submit
              maintenance requests, track payments, and know your rights.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/onboarding">
                Find my property <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Feature preview cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Wrench, label: "Submit Requests", desc: "Report maintenance issues with photos" },
            { icon: Scale, label: "Know Your Rights", desc: "AI-powered legal guidance" },
            { icon: FileText, label: "Lease Review", desc: "AI flags risky terms" },
            { icon: FolderOpen, label: "Document Issues", desc: "Build your evidence trail" },
          ].map((f) => (
            <Card key={f.label} className="bg-muted/30">
              <CardContent className="py-4 text-center">
                <f.icon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Know your rights</h2>
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

  // ── Linked — full dashboard ──
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
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50 border border-primary/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome home{homeData.tenant?.name ? `, ${homeData.tenant.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {fullAddress} · Unit {unit?.unitIdentifier}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/tenant/settings">
              <Button variant="outline" size="sm">
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                My Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Rent Due */}
        <Link href="/tenant/payments">
          <Card className={cn(
            "hover:shadow-md transition-all cursor-pointer h-full",
            daysUntilDue <= 5 ? "border-amber-300 bg-amber-50/50" : "hover:border-primary/30"
          )}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "rounded-xl p-2.5",
                  daysUntilDue <= 5 ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  <DollarSign className={cn(
                    "h-5 w-5",
                    daysUntilDue <= 5 ? "text-amber-600" : "text-emerald-600"
                  )} />
                </div>
                {daysUntilDue <= 5 && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Due Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Rent Due</p>
              <p className="text-2xl font-bold mt-0.5">
                {rentAmount ? `$${Number(rentAmount).toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <Clock className="inline h-3 w-3 mr-1" />
                {daysUntilDue} days until next due date
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Lease Status */}
        <Link href="/tenant/lease">
          <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  lease?.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {lease?.status ? lease.status.charAt(0).toUpperCase() + lease.status.slice(1) : "N/A"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Lease</p>
              <p className="text-lg font-bold mt-0.5">
                {lease?.endDate
                  ? `Ends ${new Date(lease.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "No lease on file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI review available
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Open Requests */}
        <Link href="/tenant/requests">
          <Card className={cn(
            "hover:shadow-md transition-all cursor-pointer h-full",
            maintenanceCount > 0 ? "border-orange-200 bg-orange-50/30" : "hover:border-primary/30"
          )}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "rounded-xl p-2.5",
                  maintenanceCount > 0 ? "bg-orange-100" : "bg-green-100"
                )}>
                  <Wrench className={cn(
                    "h-5 w-5",
                    maintenanceCount > 0 ? "text-orange-600" : "text-green-600"
                  )} />
                </div>
                {maintenanceCount > 0 && (
                  <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {maintenanceCount} open
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold mt-0.5">{maintenanceCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {maintenanceCount === 0 ? (
                  <><CheckCircle2 className="inline h-3 w-3 mr-1 text-green-500" />All clear</>
                ) : (
                  <><AlertCircle className="inline h-3 w-3 mr-1" />In progress</>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Messages */}
        <Link href="/tenant/messages">
          <Card className={cn(
            "hover:shadow-md transition-all cursor-pointer h-full",
            unreadNotifs > 0 ? "border-primary/30 bg-primary/5" : "hover:border-primary/30"
          )}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "rounded-xl p-2.5",
                  unreadNotifs > 0 ? "bg-primary/10" : "bg-gray-100"
                )}>
                  <MessageSquare className={cn(
                    "h-5 w-5",
                    unreadNotifs > 0 ? "text-primary" : "text-gray-500"
                  )} />
                </div>
                {unreadNotifs > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="text-lg font-bold mt-0.5">
                {unreadNotifs > 0 ? `${unreadNotifs} unread` : "All caught up"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Notices & alerts
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Quick Actions Grid ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/tenant/requests", icon: Wrench, label: "Submit\nRequest", color: "bg-orange-50 text-orange-600 border-orange-100" },
            { href: "/tenant/lease", icon: FileText, label: "View\nLease", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { href: "/tenant/rights", icon: Scale, label: "Know Your\nRights", color: "bg-purple-50 text-purple-600 border-purple-100" },
            { href: "/tenant/documents", icon: FolderOpen, label: "Log an\nIssue", color: "bg-green-50 text-green-600 border-green-100" },
            { href: "/tenant/inspection", icon: ClipboardCheck, label: "Inspection\nChecklist", color: "bg-teal-50 text-teal-600 border-teal-100" },
            { href: "/tenant/payments", icon: CreditCard, label: "Payment\nHistory", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className={cn(
                "hover:shadow-md transition-all cursor-pointer h-full border",
                action.color.split(" ").pop()
              )}>
                <CardContent className="py-5 text-center">
                  <div className={cn(
                    "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl",
                    action.color.split(" ").slice(0, 2).join(" ")
                  )}>
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

      {/* ── Two-column: Recent Requests + AI Tools ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                Recent Requests
              </CardTitle>
              <Link href="/tenant/requests" className="text-xs text-primary hover:underline font-medium">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {latestRequests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 mb-2 text-green-400" />
                <p className="text-sm font-medium">No recent requests</p>
                <p className="text-xs mt-1">Everything looks good!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-full p-1.5",
                        req.urgency === "emergency" ? "bg-red-100" :
                        req.urgency === "urgent" ? "bg-amber-100" : "bg-blue-100"
                      )}>
                        <Wrench className={cn(
                          "h-3.5 w-3.5",
                          req.urgency === "emergency" ? "text-red-600" :
                          req.urgency === "urgent" ? "text-amber-600" : "text-blue-600"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{req.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      req.status === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {req.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI-Powered Tools */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/tenant/rights">
              <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50/50 p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Rights Assistant</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ask any question — get plain-English answers grounded in DC/MD law.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary ml-auto shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>

            <Link href="/lease-review">
              <div className="rounded-lg border border-blue-200/50 bg-blue-50/30 p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Lease Review</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload your lease — get AI-flagged issues with legal explanations.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600 ml-auto shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>

            <Link href="/tenant/escalation">
              <div className="rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Escalation Guide</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Step-by-step process for filing complaints with DCRA or PG County.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>

            <Link href="/tenant/documents">
              <div className="rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <FolderOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Issue Documentation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Timestamped log with photos — exportable if things escalate.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Property Info + Rights ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Property Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Address", value: fullAddress },
                { label: "Unit", value: unit?.unitIdentifier || "—" },
                { label: "Bedrooms", value: unit?.bedrooms ? `${unit.bedrooms} BR` : "—" },
                { label: "Bathrooms", value: unit?.bathrooms ? `${unit.bathrooms} BA` : "—" },
                { label: "Size", value: unit?.squareFeet ? `${unit.squareFeet} sq ft` : "—" },
                { label: "Jurisdiction", value: jurisdiction === "pg_county" ? "PG County, MD" : jurisdiction === "dc" ? "Washington, DC" : jurisdiction.toUpperCase() },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Know Your Rights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Know Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {RIGHTS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href.replace("dc", jurisdiction === "pg_county" ? "pg" : "dc")}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline rounded-lg border p-3 hover:bg-primary/5 transition-colors"
                  >
                    <FileText className="h-4 w-4 shrink-0" aria-hidden />
                    {link.label}
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/tenant-rights?jurisdiction=${jurisdiction === "pg_county" ? "pg" : "dc"}`}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View full rights library
              <ExternalLink className="h-3.5 w-3.5 ml-1" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
