"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  Filter,
} from "lucide-react";

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
  tenantName: string | null;
  tenantEmail: string | null;
  tenantPhone: string | null;
};

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-700" },
  { value: "acknowledged", label: "Acknowledged", color: "bg-purple-100 text-purple-700" },
  { value: "scheduled", label: "Scheduled", color: "bg-indigo-100 text-indigo-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
];

const URGENCY_STYLES: Record<string, string> = {
  emergency: "bg-red-100 text-red-700 border-red-200",
  urgent: "bg-amber-100 text-amber-700 border-amber-200",
  routine: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MaintenanceRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");

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
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  }

  const filtered = requests.filter((r) => {
    if (filter === "open") return r.status !== "completed" && r.status !== "tenant_confirmed";
    if (filter === "completed") return r.status === "completed" || r.status === "tenant_confirmed";
    return true;
  });

  const openCount = requests.filter(
    (r) => r.status !== "completed" && r.status !== "tenant_confirmed"
  ).length;
  const emergencyCount = requests.filter(
    (r) => r.urgency === "emergency" && r.status !== "completed"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage requests from your tenants across all properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-medium">
              {openCount} open
            </span>
          )}
          {emergencyCount > 0 && (
            <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-medium">
              {emergencyCount} emergency
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all" as const, label: `All (${requests.length})` },
          { key: "open" as const, label: `Open (${openCount})` },
          { key: "completed" as const, label: `Completed (${requests.length - openCount})` },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold">No maintenance requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When tenants submit maintenance requests, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((req) => {
            const isExpanded = expandedId === req.id;
            const urgencyStyle = URGENCY_STYLES[req.urgency] ?? URGENCY_STYLES.routine;
            const statusInfo = STATUS_OPTIONS.find((s) => s.value === req.status);
            const isOverdue = req.legalDeadline && new Date(req.legalDeadline) < new Date() && req.status !== "completed";

            return (
              <Card
                key={req.id}
                className={`transition-colors ${isOverdue ? "border-red-300 bg-red-50/30" : ""} ${req.urgency === "emergency" && req.status !== "completed" ? "border-red-200" : ""}`}
              >
                <CardContent className="py-4">
                  {/* Header row */}
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`shrink-0 rounded-full p-2 ${urgencyStyle}`}>
                          {req.urgency === "emergency" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Wrench className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{req.category}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyStyle}`}>
                              {req.urgency}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo?.color ?? "bg-gray-100 text-gray-700"}`}>
                              {statusInfo?.label ?? req.status.replace(/_/g, " ")}
                            </span>
                            {isOverdue && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {req.propertyName ?? req.propertyAddress} · {req.unitIdentifier}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {req.tenantName ?? "Tenant"}
                            </span>
                            <span>
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                        <p className="text-sm">{req.description}</p>
                      </div>

                      {/* Tenant contact */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tenant Contact</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {req.tenantName ?? "—"}
                          </span>
                          {req.tenantEmail && (
                            <a href={`mailto:${req.tenantEmail}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Mail className="h-3.5 w-3.5" />
                              {req.tenantEmail}
                            </a>
                          )}
                          {req.tenantPhone && (
                            <a href={`tel:${req.tenantPhone}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Phone className="h-3.5 w-3.5" />
                              {req.tenantPhone}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Legal deadline */}
                      {req.legalDeadline && (
                        <div className={`rounded-lg p-3 text-sm ${isOverdue ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${isOverdue ? "text-red-600" : "text-amber-600"}`} />
                            <span className="font-medium">
                              Legal deadline: {new Date(req.legalDeadline).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                              })}
                            </span>
                            {isOverdue && <span className="text-red-700 font-semibold text-xs">— OVERDUE</span>}
                          </div>
                        </div>
                      )}

                      {/* Photos */}
                      {req.photos && JSON.parse(req.photos).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Photos</p>
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(req.photos).map((photo: string, i: number) => (
                              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border">
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status update actions */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <Button
                              key={s.value}
                              variant={req.status === s.value ? "default" : "outline"}
                              size="sm"
                              disabled={updatingId === req.id}
                              onClick={() => updateStatus(req.id, s.value)}
                              className="text-xs"
                            >
                              {updatingId === req.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : req.status === s.value ? (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              ) : null}
                              {s.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
