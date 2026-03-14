"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  Wrench,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
  Scale,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSearch,
  X,
  Home,
  MessageCircleQuestion,
  Circle,
} from "lucide-react";

/* ───────── Types ───────── */

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

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
};

const jurisdictionLabels: Record<string, string> = {
  dc: "Washington D.C.",
  maryland: "Maryland",
  pg_county: "PG County",
};

const LEGAL_RESPONSE: Record<string, Record<string, { hours: number; cite: string }>> = {
  dc: {
    emergency: { hours: 24, cite: "D.C. Code § 42-3505.01" },
    urgent: { hours: 72, cite: "14 DCMR § 304" },
    routine: { hours: 336, cite: "14 DCMR § 304" },
  },
  maryland: {
    emergency: { hours: 24, cite: "MD Code § 8-211" },
    urgent: { hours: 168, cite: "MD Code § 8-211" },
    routine: { hours: 720, cite: "MD Code § 8-211" },
  },
  pg_county: {
    emergency: { hours: 24, cite: "PG County § 13-172" },
    urgent: { hours: 168, cite: "PG County § 13-172" },
    routine: { hours: 720, cite: "PG County § 13-172" },
  },
};

function getHoursAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
}

function getTimeAgoLabel(dateStr: string): string {
  const hours = getHoursAgo(dateStr);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/* ───────── Page ───────── */

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChecklistDismissed(localStorage.getItem("rw_checklist_dismissed") === "true");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const s = summary ?? {
    openMaintenance: 0,
    emergencyRequests: 0,
    totalProperties: 0,
    totalUnits: 0,
    activeTenants: 0,
    pendingApplications: 0,
    complianceDeadlinesSoon: 0,
    unreadMessages: 0,
  };

  // Find the most urgent emergency request for the banner
  const emergencyReq = recentRequests.find((r) => r.urgency === "emergency" && r.status !== "completed");

  // Compute some derived stats
  const uniqueJurisdictions = [...new Set(propertyList.map((p) => p.jurisdiction))].length;
  const vacantUnits = Math.max(0, s.totalUnits - s.activeTenants);

  // Checklist state
  const hasProperties = s.totalProperties > 0;
  const hasTenants = s.activeTenants > 0;
  const showChecklist = !checklistDismissed && s.totalProperties < 3;
  const checklistItems = [
    { label: "Add your first property", done: hasProperties, href: "/dashboard/properties" },
    { label: "Add a tenant", done: hasTenants, href: "/dashboard/tenants" },
    { label: "Upload a lease for AI review", done: false, href: "/lease-review", action: "Upload" },
    { label: "Run your first compliance check", done: false, href: "/lease-review", action: "Run check" },
    { label: "Set up maintenance request intake", done: s.openMaintenance > 0, href: "/dashboard/maintenance", action: "Set up" },
  ];
  const completedSteps = checklistItems.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      {/* ═══════════ PROMPT 1: Smart Alert Banner ═══════════ */}
      {!bannerDismissed && (
        <>
          {s.emergencyRequests > 0 && emergencyReq ? (
            <div className="relative bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-red-900">
                    Emergency request requires attention
                  </p>
                  <p className="text-sm text-red-600 mt-0.5">
                    {emergencyReq.category} reported at{" "}
                    {emergencyReq.propertyAddress}, {emergencyReq.unitIdentifier}{" "}
                    &mdash; response required within 24 hours
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    Submitted {getTimeAgoLabel(emergencyReq.createdAt)}
                    {" "}&middot;{" "}
                    {(() => {
                      const matchedProp = propertyList.find((p) =>
                        emergencyReq.propertyAddress?.includes(p.addressLine1)
                      );
                      const jur = matchedProp?.jurisdiction ?? "dc";
                      return LEGAL_RESPONSE[jur]?.emergency?.cite ?? "D.C. Code § 42-3505.01";
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Link
                  href="/dashboard/maintenance"
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  Respond Now &rarr;
                </Link>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-current opacity-40 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : s.complianceDeadlinesSoon > 0 ? (
            <div className="relative bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-amber-900">
                    {s.complianceDeadlinesSoon} lease{s.complianceDeadlinesSoon === 1 ? "" : "s"} due for review
                  </p>
                  <p className="text-sm text-amber-600 mt-0.5">
                    Upcoming compliance deadlines need your attention.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Link
                  href="/lease-review"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  Review Now &rarr;
                </Link>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-current opacity-40 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : s.openMaintenance > 0 ? (
            /* There are open but non-emergency requests */
            <div className="relative bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-amber-900">
                    {s.openMaintenance} open maintenance request{s.openMaintenance === 1 ? "" : "s"}
                  </p>
                  <p className="text-sm text-amber-600 mt-0.5">
                    Review and respond to tenant requests to stay compliant.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Link
                  href="/dashboard/maintenance"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  View Requests &rarr;
                </Link>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-current opacity-40 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">
                All clear &mdash; your properties are compliant and no open issues.
              </p>
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-auto text-current opacity-40 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════ PROMPT 2: Stat Cards ═══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Properties */}
        <Link href="/dashboard/properties" className="group">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {s.totalUnits} unit{s.totalUnits === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{s.totalProperties}</p>
            <p className="text-sm text-slate-500 mt-0.5">Properties</p>
            {uniqueJurisdictions > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {uniqueJurisdictions} jurisdiction{uniqueJurisdictions === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </Link>

        {/* Active Tenants */}
        <Link href="/dashboard/tenants" className="group">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{s.activeTenants}</p>
            <p className="text-sm text-slate-500 mt-0.5">Active Tenants</p>
            {vacantUnits > 0 && (
              <p className="text-xs text-amber-500 mt-1">
                {vacantUnits} vacant unit{vacantUnits === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </Link>

        {/* Open Requests */}
        <Link href="/dashboard/maintenance" className="group">
          <div
            className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all duration-200 cursor-pointer h-full ${
              s.emergencyRequests > 0
                ? "border-red-200 bg-red-50/30"
                : s.openMaintenance > 0
                ? "border-amber-200 bg-amber-50/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              {s.emergencyRequests > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {s.emergencyRequests} emergency
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{s.openMaintenance}</p>
            <p className="text-sm text-slate-500 mt-0.5">Open Requests</p>
            {s.emergencyRequests > 0 && (
              <p className="text-xs text-red-500 font-medium mt-1">Action needed within 24hrs</p>
            )}
          </div>
        </Link>

        {/* Active Leases */}
        <Link href="/dashboard/leases" className="group">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                &#10003; Compliant
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{s.totalProperties}</p>
            <p className="text-sm text-slate-500 mt-0.5">Active Leases</p>
            <p className="text-xs text-slate-400 mt-1">AI compliance check available</p>
          </div>
        </Link>
      </div>

      {/* ═══════════ PROMPT 8: Getting Started Checklist ═══════════ */}
      {showChecklist && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
              Get the most out of RentWise
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                {completedSteps} of {checklistItems.length} complete
              </span>
              <button
                onClick={() => {
                  setChecklistDismissed(true);
                  localStorage.setItem("rw_checklist_dismissed", "true");
                }}
                className="text-current opacity-40 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / checklistItems.length) * 100}%` }}
            />
          </div>
          {/* Items */}
          <div className="mt-4 space-y-2">
            {checklistItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <span
                  className={`text-sm flex-1 ${
                    item.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {!item.done && item.action && (
                  <Link
                    href={item.href}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0"
                  >
                    {item.action} &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ PROMPT 3: Quick Actions ═══════════ */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>

        {/* Primary row */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/lease-review" className="group">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm transition-all duration-200 cursor-pointer min-h-[100px]">
              <FileSearch className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-slate-700 mt-2">Review a Lease</p>
              <p className="text-xs text-slate-400 mt-0.5">AI compliance check</p>
              <span className="text-[10px] text-blue-500 font-semibold mt-1">&#10022; AI</span>
            </div>
          </Link>

          <Link href="/dashboard/maintenance" className="group">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm transition-all duration-200 cursor-pointer min-h-[100px] relative">
              <div className="relative">
                <Wrench className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
                {s.emergencyRequests > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-2">View Requests</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {s.openMaintenance > 0
                  ? `${s.openMaintenance} need${s.openMaintenance === 1 ? "s" : ""} attention`
                  : "All clear"}
              </p>
            </div>
          </Link>

          <Link href="/dashboard/properties" className="group">
            <div className="bg-slate-50/50 border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 cursor-pointer min-h-[100px]">
              <div className="w-7 h-7 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-2">Add Property</p>
              <p className="text-xs text-slate-400 mt-0.5">Expand your portfolio</p>
            </div>
          </Link>
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <Link href="/dashboard/tenants" className="group">
            <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-all cursor-pointer min-h-[56px]">
              <Users className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-600">Manage Tenants</span>
            </div>
          </Link>

          <Link href="/dashboard/inspections" className="group">
            <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-all cursor-pointer min-h-[56px]">
              <ClipboardCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-600">Run Inspection</span>
            </div>
          </Link>

          <Link href="/tenant-rights" className="group">
            <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-all cursor-pointer min-h-[56px]">
              <Scale className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-600">Ask a Legal Question</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════ PROMPTS 4 & 5: Two-Column Layout ═══════════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Recent Requests (Prompt 4) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900">Recent Requests</h3>
            </div>
            <Link
              href="/dashboard/maintenance"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all &rarr;
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Wrench className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-400 mt-2">No maintenance requests</p>
              <p className="text-xs text-slate-300 mt-1">
                Your tenants can submit requests through their portal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => {
                const isEmergency = req.urgency === "emergency";
                const isUrgent = req.urgency === "urgent";
                const hoursAgo = getHoursAgo(req.createdAt);
                // Guess jurisdiction from properties list
                const matchedProp = propertyList.find((p) =>
                  req.propertyAddress?.includes(p.addressLine1)
                );
                const jur = matchedProp?.jurisdiction ?? "dc";
                const legalInfo =
                  LEGAL_RESPONSE[jur]?.[req.urgency] ??
                  LEGAL_RESPONSE.dc[req.urgency] ??
                  LEGAL_RESPONSE.dc.routine;
                const legalHours = legalInfo.hours;
                const legalCite = legalInfo.cite;

                return (
                  <Link key={req.id} href="/dashboard/maintenance">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {isEmergency ? (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                          ) : isUrgent ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                          )}
                          <span className="text-sm font-semibold text-slate-900">
                            {req.category}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              isEmergency
                                ? "bg-red-50 text-red-600 border-red-200"
                                : isUrgent
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-blue-50 text-blue-600 border-blue-200"
                            }`}
                          >
                            {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            req.status === "submitted"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : req.status === "in_progress"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : req.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {STATUS_LABELS[req.status] ?? req.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Middle row */}
                      <p className="text-xs text-slate-500 mt-1.5">
                        {req.tenantName ?? "Tenant"} &middot;{" "}
                        {req.propertyAddress}, {req.unitIdentifier}
                      </p>

                      {/* Legal context row */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            isEmergency ? "text-red-500" : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isEmergency ? "text-red-600" : "text-slate-500"
                          }`}
                        >
                          {isEmergency
                            ? `Response required within ${legalHours}hrs`
                            : `${Math.round(legalHours / 24)}-day response window`}
                        </span>
                        <span className="text-xs text-slate-400">
                          &middot; {legalCite}
                        </span>
                        <span className="text-xs text-slate-400">
                          &middot; {getTimeAgoLabel(req.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Your Properties (Prompt 5) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-semibold text-slate-900">Your Properties</h3>
            </div>
            <Link
              href="/dashboard/properties"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage &rarr;
            </Link>
          </div>

          {propertyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Building2 className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-400 mt-2">No properties yet</p>
              <p className="text-xs text-slate-300 mt-1">Add your first property to get started</p>
              <Link
                href="/dashboard/properties"
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="inline w-3.5 h-3.5 mr-1" />
                Add Property
              </Link>
            </div>
          ) : (
            <div>
              {propertyList.map((p, idx) => {
                // Determine occupancy — if we have any tenants linked to this property
                const isOccupied = s.activeTenants > 0 && idx === 0; // simple heuristic
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between py-3 ${
                      idx < propertyList.length - 1 ? "border-b border-slate-100" : ""
                    } ${idx === 0 ? "" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {p.name || p.addressLine1}
                        </p>
                        <p className="text-xs text-slate-400">
                          {p.city && p.state ? `${p.city}, ${p.state}` : p.addressLine1}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOccupied ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isOccupied ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {isOccupied ? "Occupied" : "Vacant"}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {jurisdictionLabels[p.jurisdiction] ?? p.jurisdiction}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add property row */}
              <Link href="/dashboard/properties">
                <div className="flex items-center gap-3 py-3 mt-1 border-t border-dashed border-slate-200 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-9 h-9 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-400">Add another property</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ PROMPT 6: AI-Powered Tools ═══════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">AI-Powered Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Lease Review */}
          <Link href="/lease-review" className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <FileSearch className="w-8 h-8 text-white/90" />
              <p className="text-base font-bold text-white mt-3">AI Lease Review</p>
              <p className="text-sm text-blue-100 leading-relaxed mt-1">
                Upload any lease and get instant compliance analysis with legal citations for DC and Maryland law.
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-blue-200">
                  {s.totalProperties} lease{s.totalProperties === 1 ? "" : "s"} &mdash; ready for review
                </span>
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Ask a Legal Question */}
          <Link href="/tenant-rights" className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <MessageCircleQuestion className="w-8 h-8 text-white/90" />
              <p className="text-base font-bold text-white mt-3">Ask a Legal Question</p>
              <p className="text-sm text-emerald-100 leading-relaxed mt-1">
                Get AI-powered answers about DC and Maryland landlord-tenant law &mdash; repairs, deposits, evictions, and more.
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-emerald-200">Powered by DC &amp; MD housing codes</span>
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Inspections */}
          <Link href="/dashboard/inspections" className="group">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg hover:shadow-slate-700/20 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <ClipboardCheck className="w-8 h-8 text-white/90" />
              <p className="text-base font-bold text-white mt-3">Property Inspections</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-1">
                Run move-in/move-out inspections with photo documentation and HQS compliance checklists.
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">0 inspections this month</span>
                <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
