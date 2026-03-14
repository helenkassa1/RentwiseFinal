"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Loader2,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  Shield,
  Scale,
  Calendar,
  FileText,
  MessageSquare,
  CircleCheck,
  CircleAlert,
  Info,
} from "lucide-react";

/* ───────── Types ───────── */

type MaintenanceRow = {
  id: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  photos: string;
  legalDeadline: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  unitIdentifier: string;
  propertyAddress: string;
  propertyName: string | null;
  jurisdiction: string;
  tenantId: string;
  tenantName: string | null;
  tenantEmail: string | null;
  tenantPhone: string | null;
  // Legal enrichment from API
  legalDeadlineDate: string;
  legalCitation: string;
  legalResponseHours: number;
  legalResponseGuidance: string;
  legalRequiredActions: string[];
  legalHoursRemaining: number;
  legalIsOverdue: boolean;
};

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "acknowledged", label: "Acknowledged", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "scheduled", label: "Scheduled", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
];

const URGENCY_STYLES: Record<string, string> = {
  emergency: "bg-red-50 text-red-600 border-red-200",
  urgent: "bg-amber-50 text-amber-600 border-amber-200",
  routine: "bg-blue-50 text-blue-600 border-blue-200",
};

const URGENCY_CARD_BORDER: Record<string, string> = {
  emergency: "border-red-200 bg-red-50/20",
  urgent: "border-amber-200 bg-amber-50/10",
  routine: "",
};

// Pre-written acknowledgment templates
const ACK_TEMPLATES: Record<string, string> = {
  emergency:
    "We have received your emergency maintenance request and are treating it as a priority. A repair team has been notified and will respond within 24 hours as required by law. We will keep you updated on progress. If the situation worsens, please contact us immediately.",
  urgent:
    "Thank you for reporting this maintenance issue. We have received your request and are working to schedule a repair as soon as possible. You can expect a resolution within the legally required timeframe. We will notify you once a repair date is confirmed.",
  routine:
    "We have received your maintenance request and it has been added to our repair schedule. We will notify you when a repair date has been confirmed. Thank you for bringing this to our attention.",
  acknowledged:
    "Your maintenance request has been acknowledged and assigned to our maintenance team. We are working on getting this resolved for you promptly.",
  scheduled:
    "Good news — a repair has been scheduled for your maintenance request. We will confirm the exact date and time shortly. Please ensure access to the unit is available.",
  in_progress:
    "Work on your maintenance request is now in progress. Our repair team is on-site or has been dispatched. We will notify you once the repair is complete.",
  completed:
    "Your maintenance request has been marked as completed. Please inspect the repair and let us know if there are any remaining issues. If everything looks good, no further action is needed on your part.",
};

function getTimeAgoLabel(dateStr: string): string {
  const hours = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
  );
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/* ───────── Page ───────── */

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MaintenanceRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");

  // Acknowledgment message state
  const [ackRequestId, setAckRequestId] = useState<string | null>(null);
  const [ackMessage, setAckMessage] = useState("");
  const [ackSending, setAckSending] = useState(false);
  const [ackSent, setAckSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard/maintenance")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/dashboard/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      /* ignore */
    } finally {
      setUpdatingId(null);
    }
  }

  async function sendAcknowledgment(id: string, status?: string) {
    if (!ackMessage.trim()) return;
    setAckSending(true);
    try {
      const res = await fetch("/api/dashboard/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...(status ? { status } : {}),
          acknowledgmentMessage: ackMessage.trim(),
        }),
      });
      if (res.ok) {
        setAckSent((prev) => new Set([...prev, id]));
        if (status) {
          setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status } : r))
          );
        }
        setAckRequestId(null);
        setAckMessage("");
      }
    } catch {
      /* ignore */
    } finally {
      setAckSending(false);
    }
  }

  const filtered = requests.filter((r) => {
    if (filter === "open")
      return r.status !== "completed" && r.status !== "tenant_confirmed";
    if (filter === "completed")
      return r.status === "completed" || r.status === "tenant_confirmed";
    return true;
  });

  const openCount = requests.filter(
    (r) => r.status !== "completed" && r.status !== "tenant_confirmed"
  ).length;
  const emergencyCount = requests.filter(
    (r) =>
      r.urgency === "emergency" &&
      r.status !== "completed" &&
      r.status !== "tenant_confirmed"
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Maintenance Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage requests from your tenants across all properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 text-xs font-semibold">
              {openCount} open
            </span>
          )}
          {emergencyCount > 0 && (
            <span className="rounded-full bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {emergencyCount} emergency
            </span>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2">
        {(
          [
            { key: "all" as const, label: `All (${requests.length})` },
            { key: "open" as const, label: `Open (${openCount})` },
            {
              key: "completed" as const,
              label: `Completed (${requests.length - openCount})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Wrench className="w-12 h-12 text-slate-200" />
          <p className="text-lg font-medium text-slate-400 mt-3">
            No maintenance requests yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            When tenants submit maintenance requests, they will appear here.
          </p>
        </div>
      )}

      {/* ── Request Cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isExpanded = expandedId === req.id;
            const urgencyStyle =
              URGENCY_STYLES[req.urgency] ?? URGENCY_STYLES.routine;
            const statusInfo = STATUS_OPTIONS.find(
              (s) => s.value === req.status
            );
            const isOverdue = req.legalIsOverdue;
            const cardBorder =
              URGENCY_CARD_BORDER[req.urgency] ?? "";
            const needsAck =
              req.status === "submitted" && !ackSent.has(req.id);
            const showAckPanel = ackRequestId === req.id;

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isOverdue
                    ? "border-red-300 bg-red-50/30 shadow-sm"
                    : req.urgency === "emergency" &&
                      req.status !== "completed"
                    ? cardBorder
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* ── Collapsed header ── */}
                <button
                  className="w-full text-left p-5"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : req.id)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`shrink-0 rounded-xl p-2.5 ${urgencyStyle}`}
                      >
                        {req.urgency === "emergency" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Wrench className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-slate-900">
                            {req.category}
                          </p>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${urgencyStyle}`}
                          >
                            {req.urgency.charAt(0).toUpperCase() +
                              req.urgency.slice(1)}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              statusInfo?.color ??
                              "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {statusInfo?.label ??
                              req.status.replace(/_/g, " ")}
                          </span>
                          {isOverdue && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                              OVERDUE
                            </span>
                          )}
                          {needsAck && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Needs acknowledgment
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {req.propertyName ?? req.propertyAddress}{" "}
                            &middot; {req.unitIdentifier}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {req.tenantName ?? "Tenant"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {getTimeAgoLabel(req.createdAt)}
                          </span>
                        </div>
                        {/* Inline legal deadline preview */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock
                            className={`w-3.5 h-3.5 ${
                              isOverdue || req.urgency === "emergency"
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isOverdue
                                ? "text-red-600"
                                : req.urgency === "emergency"
                                ? "text-red-600"
                                : "text-slate-500"
                            }`}
                          >
                            {isOverdue
                              ? `OVERDUE — was due ${Math.abs(req.legalHoursRemaining)}hrs ago`
                              : `${req.legalHoursRemaining}hrs remaining`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            &middot; {req.legalCitation}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                    )}
                  </div>
                </button>

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-5">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Description
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    {/* ── LEGAL COMPLIANCE PANEL ── */}
                    <div
                      className={`rounded-2xl border p-4 space-y-3 ${
                        isOverdue
                          ? "bg-red-50 border-red-200"
                          : req.urgency === "emergency"
                          ? "bg-red-50/50 border-red-200"
                          : req.urgency === "urgent"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-blue-50/50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Scale
                          className={`w-4 h-4 ${
                            isOverdue || req.urgency === "emergency"
                              ? "text-red-600"
                              : req.urgency === "urgent"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            isOverdue || req.urgency === "emergency"
                              ? "text-red-900"
                              : req.urgency === "urgent"
                              ? "text-amber-900"
                              : "text-blue-900"
                          }`}
                        >
                          Legal Response Requirements
                        </p>
                      </div>

                      {/* Deadline countdown */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Clock
                            className={`w-4 h-4 ${
                              isOverdue ? "text-red-600" : "text-slate-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isOverdue ? "text-red-700" : "text-slate-700"
                            }`}
                          >
                            {isOverdue
                              ? `OVERDUE by ${Math.abs(req.legalHoursRemaining)} hours`
                              : `${req.legalHoursRemaining} hours remaining`}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Deadline:{" "}
                          {new Date(req.legalDeadlineDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      {/* Citation & guidance */}
                      <div className="bg-white/70 rounded-xl p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-600">
                            <span className="font-semibold">
                              {req.legalCitation}
                            </span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {req.legalResponseGuidance}
                        </p>
                      </div>

                      {/* Required actions checklist */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Required Actions
                        </p>
                        <div className="space-y-1.5">
                          {req.legalRequiredActions.map((action, i) => {
                            // Mark first action as done if status >= acknowledged
                            const statusOrder = [
                              "submitted",
                              "acknowledged",
                              "scheduled",
                              "in_progress",
                              "completed",
                            ];
                            const currentIdx = statusOrder.indexOf(
                              req.status
                            );
                            const isDone = i < currentIdx;
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-2"
                              >
                                {isDone ? (
                                  <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <CircleAlert
                                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                                      i === currentIdx
                                        ? isOverdue
                                          ? "text-red-500"
                                          : "text-amber-500"
                                        : "text-slate-300"
                                    }`}
                                  />
                                )}
                                <span
                                  className={`text-xs leading-relaxed ${
                                    isDone
                                      ? "text-slate-400 line-through"
                                      : i === currentIdx
                                      ? "text-slate-700 font-medium"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {action}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ── Tenant Contact ── */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Tenant Contact
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {req.tenantName ?? "\u2014"}
                        </span>
                        {req.tenantEmail && (
                          <a
                            href={`mailto:${req.tenantEmail}`}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {req.tenantEmail}
                          </a>
                        )}
                        {req.tenantPhone && (
                          <a
                            href={`tel:${req.tenantPhone}`}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {req.tenantPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* ── Photos ── */}
                    {req.photos &&
                      (() => {
                        try {
                          const parsed = JSON.parse(req.photos);
                          return parsed.length > 0 ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Photos
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {parsed.map(
                                  (photo: string, i: number) => (
                                    <div
                                      key={i}
                                      className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
                                    >
                                      <img
                                        src={photo}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          ) : null;
                        } catch {
                          return null;
                        }
                      })()}

                    {/* ── ACKNOWLEDGMENT / MESSAGE PANEL ── */}
                    {needsAck && !showAckPanel && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900">
                              Acknowledge this request
                            </p>
                            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                              {req.legalCitation} requires you to
                              acknowledge receipt of this{" "}
                              {req.urgency} maintenance request in
                              writing. Send a message to your tenant
                              confirming you&apos;ve received it and
                              outline next steps.
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAckRequestId(req.id);
                                setAckMessage(
                                  ACK_TEMPLATES[req.urgency] ??
                                    ACK_TEMPLATES.routine
                                );
                              }}
                              className="mt-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send Acknowledgment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {ackSent.has(req.id) && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium">
                          Acknowledgment sent to tenant
                        </span>
                      </div>
                    )}

                    {showAckPanel && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-semibold text-slate-900">
                            Send Message to Tenant
                          </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                              This message will be sent as an in-app
                              notification to{" "}
                              <span className="font-semibold">
                                {req.tenantName ?? "the tenant"}
                              </span>
                              . It also serves as your written
                              acknowledgment per {req.legalCitation}.
                            </p>
                          </div>
                        </div>

                        {/* Quick template buttons */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-slate-400 mr-1 self-center">
                            Templates:
                          </span>
                          {[
                            {
                              label: "Acknowledge",
                              key:
                                req.urgency === "emergency"
                                  ? "emergency"
                                  : req.urgency === "urgent"
                                  ? "urgent"
                                  : "routine",
                            },
                            {
                              label: "Scheduled",
                              key: "scheduled",
                            },
                            {
                              label: "In Progress",
                              key: "in_progress",
                            },
                            {
                              label: "Completed",
                              key: "completed",
                            },
                          ].map((t) => (
                            <button
                              key={t.key}
                              onClick={() =>
                                setAckMessage(
                                  ACK_TEMPLATES[t.key] ??
                                    ACK_TEMPLATES.routine
                                )
                              }
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={ackMessage}
                          onChange={(e) =>
                            setAckMessage(e.target.value)
                          }
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none"
                          placeholder="Type your message to the tenant..."
                        />

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              sendAcknowledgment(
                                req.id,
                                req.status === "submitted"
                                  ? "acknowledged"
                                  : undefined
                              )
                            }
                            disabled={
                              ackSending || !ackMessage.trim()
                            }
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors"
                          >
                            {ackSending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            {req.status === "submitted"
                              ? "Send & Mark Acknowledged"
                              : "Send Message"}
                          </button>
                          <button
                            onClick={() => {
                              setAckRequestId(null);
                              setAckMessage("");
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Status Update ── */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Update Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            disabled={updatingId === req.id}
                            onClick={() =>
                              updateStatus(req.id, s.value)
                            }
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                              req.status === s.value
                                ? "bg-slate-900 text-white border-slate-900"
                                : `${s.color} hover:shadow-sm`
                            }`}
                          >
                            {updatingId === req.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : req.status === s.value ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : null}
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Quick send message button (if not already showing ack panel) */}
                      {!needsAck && !showAckPanel && !ackSent.has(req.id) && req.status !== "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAckRequestId(req.id);
                            // Pre-fill with status-appropriate template
                            setAckMessage(
                              ACK_TEMPLATES[req.status] ??
                                ACK_TEMPLATES.routine
                            );
                          }}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Send update to tenant
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
