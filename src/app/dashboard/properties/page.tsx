"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Plus,
  X,
  Loader2,
  Home,
  Trash2,
  Pencil,
  MoreVertical,
  AlertTriangle,
  Save,
  CheckCircle2,
  Search,
  LayoutGrid,
  List,
  Wrench,
  Users,
  Clock,
} from "lucide-react";

/* ───────── Types ───────── */

type PropertyRow = {
  id: string;
  name: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  jurisdiction: string;
  propertyType: string | null;
  createdAt: string;
  unitCount: number;
  activeTenants: number;
  openRequests: number;
  emergencyRequests: number;
  emergencyDetail: {
    category: string;
    urgency: string;
    createdAt: string;
    legalDeadline: string | null;
  } | null;
};

// Legal deadlines with statute citations
const LEGAL_DEADLINES: Record<string, Record<string, { hours: number; citation: string; shortCite: string }>> = {
  dc: {
    emergency: { hours: 24, citation: "D.C. Code § 42-3505.01 — 24-hour response for emergencies", shortCite: "D.C. Code § 42-3505.01" },
    urgent: { hours: 72, citation: "14 DCMR § 304 — 72 hours for urgent habitability issues", shortCite: "14 DCMR § 304" },
    routine: { hours: 336, citation: "14 DCMR § 304 — 14 days for routine repairs", shortCite: "14 DCMR § 304" },
  },
  maryland: {
    emergency: { hours: 24, citation: "MD Real Property § 8-211 — Reasonable time (24hrs for emergencies)", shortCite: "MD Code § 8-211" },
    urgent: { hours: 168, citation: "MD Real Property § 8-211 — Reasonable time (7 days for urgent)", shortCite: "MD Code § 8-211" },
    routine: { hours: 720, citation: "MD Real Property § 8-211 — 30 days for routine repairs", shortCite: "MD Code § 8-211" },
  },
  pg_county: {
    emergency: { hours: 24, citation: "PG County Code § 13-172 — 24-hour emergency response", shortCite: "PG County § 13-172" },
    urgent: { hours: 168, citation: "PG County Code § 13-172 — 7 days for urgent repairs", shortCite: "PG County § 13-172" },
    routine: { hours: 720, citation: "PG County Code § 13-172 — 30 days for routine repairs", shortCite: "PG County § 13-172" },
  },
};

type UnitDraft = {
  id?: string;
  identifier: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  rentAmount: string;
  isVoucherUnit: boolean;
  _deleted?: boolean;
};

const emptyUnit: UnitDraft = {
  identifier: "",
  bedrooms: "",
  bathrooms: "",
  squareFeet: "",
  rentAmount: "",
  isVoucherUnit: false,
};

const jurisdictionLabels: Record<string, string> = {
  dc: "Washington D.C.",
  maryland: "Maryland",
  pg_county: "PG County",
};

const jurisdictionColors: Record<string, string> = {
  dc: "bg-violet-50 text-violet-600 border-violet-200",
  maryland: "bg-emerald-50 text-emerald-600 border-emerald-200",
  pg_county: "bg-blue-50 text-blue-600 border-blue-200",
};

function getHoursRemaining(deadline: string): number {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60)));
}

/* ───────── Page ───────── */

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [propertyType, setPropertyType] = useState("residential");
  const [unitDrafts, setUnitDrafts] = useState<UnitDraft[]>([
    { ...emptyUnit, identifier: "Unit 1" },
  ]);

  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/properties");
      const data = await res.json();
      setProperties(data.properties ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  function resetForm() {
    setName("");
    setAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setJurisdiction("dc");
    setPropertyType("residential");
    setUnitDrafts([{ ...emptyUnit, identifier: "Unit 1" }]);
    setError(null);
    setSuccess(null);
    setEditingId(null);
  }

  async function startEdit(p: PropertyRow) {
    setEditingId(p.id);
    setName(p.name ?? "");
    setAddress(p.address);
    setCity(p.city ?? "");
    setState(p.state ?? "");
    setZipCode(p.zipCode ?? "");
    setJurisdiction(p.jurisdiction);
    setPropertyType(p.propertyType ?? "residential");
    setShowForm(true);
    setOpenMenuId(null);
    setError(null);
    setSuccess(null);

    setUnitsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/units?propertyId=${p.id}`);
      const data = await res.json();
      const existingUnits: UnitDraft[] = (data.units ?? []).map(
        (u: {
          id: string;
          identifier: string;
          bedrooms: number | null;
          bathrooms: string | null;
          squareFeet: number | null;
          rentAmount: string | null;
          isVoucherUnit: boolean;
        }) => ({
          id: u.id,
          identifier: u.identifier,
          bedrooms: u.bedrooms?.toString() ?? "",
          bathrooms: u.bathrooms?.toString() ?? "",
          squareFeet: u.squareFeet?.toString() ?? "",
          rentAmount: u.rentAmount?.toString() ?? "",
          isVoucherUnit: u.isVoucherUnit,
        })
      );
      setUnitDrafts(existingUnits.length > 0 ? existingUnits : []);
    } catch {
      setUnitDrafts([]);
    } finally {
      setUnitsLoading(false);
    }
  }

  function addUnit() {
    setUnitDrafts((prev) => {
      const visibleCount = prev.filter((u) => !u._deleted).length;
      return [...prev, { ...emptyUnit, identifier: `Unit ${visibleCount + 1}` }];
    });
  }

  function removeUnit(idx: number) {
    setUnitDrafts((prev) => {
      const unit = prev[idx];
      if (unit.id) {
        return prev.map((u, i) => (i === idx ? { ...u, _deleted: true } : u));
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  function updateUnit(idx: number, field: keyof UnitDraft, value: string | boolean) {
    setUnitDrafts((prev) =>
      prev.map((u, i) => (i === idx ? { ...u, [field]: value } : u))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        const propRes = await fetch("/api/dashboard/properties", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: name.trim() || null,
            address: address.trim(),
            city: city.trim() || null,
            state: state.trim() || null,
            zipCode: zipCode.trim() || null,
            jurisdiction,
            propertyType,
          }),
        });

        if (!propRes.ok) {
          const data = await propRes.json();
          setError(data.error || "Failed to update property.");
          return;
        }

        const unitPromises: Promise<Response>[] = [];
        for (const unit of unitDrafts) {
          if (unit._deleted && unit.id) {
            unitPromises.push(
              fetch(`/api/dashboard/units?id=${unit.id}`, { method: "DELETE" })
            );
          } else if (unit.id && !unit._deleted) {
            unitPromises.push(
              fetch("/api/dashboard/units", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: unit.id,
                  identifier: unit.identifier.trim(),
                  bedrooms: unit.bedrooms ? parseInt(unit.bedrooms, 10) : null,
                  bathrooms: unit.bathrooms || null,
                  squareFeet: unit.squareFeet ? parseInt(unit.squareFeet, 10) : null,
                  rentAmount: unit.rentAmount || null,
                  isVoucherUnit: unit.isVoucherUnit,
                }),
              })
            );
          } else if (!unit.id && !unit._deleted && unit.identifier.trim()) {
            unitPromises.push(
              fetch("/api/dashboard/units", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  propertyId: editingId,
                  identifier: unit.identifier.trim(),
                  bedrooms: unit.bedrooms ? parseInt(unit.bedrooms, 10) : null,
                  bathrooms: unit.bathrooms || null,
                  squareFeet: unit.squareFeet ? parseInt(unit.squareFeet, 10) : null,
                  rentAmount: unit.rentAmount || null,
                  isVoucherUnit: unit.isVoucherUnit,
                }),
              })
            );
          }
        }

        await Promise.all(unitPromises);
        setSuccess("Property and units updated successfully!");
        setTimeout(() => {
          resetForm();
          setShowForm(false);
        }, 1200);
      } else {
        const res = await fetch("/api/dashboard/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || null,
            address: address.trim(),
            city: city.trim() || null,
            state: state.trim() || null,
            zipCode: zipCode.trim() || null,
            jurisdiction,
            propertyType,
            unitList: unitDrafts
              .filter((u) => u.identifier.trim() && !u._deleted)
              .map((u) => ({
                identifier: u.identifier.trim(),
                bedrooms: u.bedrooms ? parseInt(u.bedrooms, 10) : null,
                bathrooms: u.bathrooms || null,
                squareFeet: u.squareFeet ? parseInt(u.squareFeet, 10) : null,
                rentAmount: u.rentAmount || null,
                isVoucherUnit: u.isVoucherUnit,
              })),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to create property.");
          return;
        }

        resetForm();
        setShowForm(false);
      }

      await fetchProperties();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/properties?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete property.");
        return;
      }
      setDeletingId(null);
      await fetchProperties();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const visibleUnits = unitDrafts.filter((u) => !u._deleted);

  // Computed stats
  const totalUnits = properties.reduce((sum, p) => sum + p.unitCount, 0);
  const totalTenants = properties.reduce((sum, p) => sum + (p.activeTenants ?? 0), 0);
  const totalVacant = Math.max(0, totalUnits - totalTenants);
  const totalOpenRequests = properties.reduce((sum, p) => sum + (p.openRequests ?? 0), 0);
  const uniqueJurisdictions = [...new Set(properties.map((p) => p.jurisdiction))].length;

  // Filtering
  const filtered = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.name ?? "").toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q);
    const matchesJurisdiction =
      jurisdictionFilter === "all" || p.jurisdiction === jurisdictionFilter;
    return matchesSearch && matchesJurisdiction;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          {properties.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {properties.length} propert{properties.length === 1 ? "y" : "ies"} across{" "}
              {uniqueJurisdictions} jurisdiction{uniqueJurisdictions === 1 ? "" : "s"}
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        )}
      </div>

      {/* ── Summary Strip ── */}
      {!showForm && properties.length > 0 && (
        <div className="flex items-center gap-6 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-sm font-medium text-slate-700">
            {properties.length} Propert{properties.length === 1 ? "y" : "ies"}
          </span>
          <div className="w-px h-4 bg-slate-200" />
          <span className="text-sm text-slate-500">
            {totalTenants} Active Tenant{totalTenants === 1 ? "" : "s"}
          </span>
          {totalVacant > 0 && (
            <>
              <div className="w-px h-4 bg-slate-200" />
              <span className="text-sm text-amber-600 font-medium">
                {totalVacant} Vacant Unit{totalVacant === 1 ? "" : "s"}
              </span>
            </>
          )}
          {totalOpenRequests > 0 && (
            <>
              <div className="w-px h-4 bg-slate-200" />
              <span className="text-sm text-red-600 font-medium">
                {totalOpenRequests} Open Request{totalOpenRequests === 1 ? "" : "s"}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Search, Filter & View Toggle ── */}
      {!showForm && properties.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            >
              <option value="all">All Jurisdictions</option>
              <option value="dc">Washington D.C.</option>
              <option value="maryland">Maryland</option>
              <option value="pg_county">PG County</option>
            </select>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Property Form ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {editingId ? "Edit Property" : "Add New Property"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Property Name{" "}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      placeholder="e.g. Sunset Apartments"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="mixed">Mixed Use</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      placeholder="DC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      placeholder="20001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Jurisdiction <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                      required
                    >
                      <option value="dc">Washington D.C.</option>
                      <option value="maryland">Maryland</option>
                      <option value="pg_county">Prince George&apos;s County</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Units */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Units ({visibleUnits.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addUnit}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Unit
                  </button>
                </div>

                {unitsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-400">Loading units...</span>
                  </div>
                )}

                {!unitsLoading && visibleUnits.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    No units yet. Click &quot;Add Unit&quot; to add units to this property.
                  </div>
                )}

                {!unitsLoading &&
                  unitDrafts.map((unit, idx) => {
                    if (unit._deleted) return null;
                    return (
                      <div
                        key={unit.id ?? `new-${idx}`}
                        className="rounded-xl border border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            {unit.id ? (
                              <>
                                {unit.identifier || `Unit ${idx + 1}`}
                                <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Existing
                                </span>
                              </>
                            ) : (
                              <>
                                New Unit
                                <span className="text-[11px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                  New
                                </span>
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeUnit(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              Name/ID
                            </label>
                            <input
                              type="text"
                              value={unit.identifier}
                              onChange={(e) => updateUnit(idx, "identifier", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                              placeholder="Unit 1A"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              Bedrooms
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unit.bedrooms}
                              onChange={(e) => updateUnit(idx, "bedrooms", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                              placeholder="2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              Bathrooms
                            </label>
                            <input
                              type="text"
                              value={unit.bathrooms}
                              onChange={(e) => updateUnit(idx, "bathrooms", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                              placeholder="1.5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              Sq Ft
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={unit.squareFeet}
                              onChange={(e) => updateUnit(idx, "squareFeet", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                              placeholder="850"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                              Rent ($/mo)
                            </label>
                            <input
                              type="text"
                              value={unit.rentAmount}
                              onChange={(e) => updateUnit(idx, "rentAmount", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                              placeholder="1500.00"
                            />
                          </div>
                          <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={unit.isVoucherUnit}
                                onChange={(e) =>
                                  updateUnit(idx, "isVoucherUnit", e.target.checked)
                                }
                                className="rounded border-slate-300"
                              />
                              Voucher
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 transition-colors"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting
                    ? editingId
                      ? "Saving..."
                      : "Creating..."
                    : editingId
                    ? (
                      <>
                        <Save className="h-4 w-4" /> Save All Changes
                      </>
                    )
                    : "Create Property"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-100 p-2.5 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Delete Property</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to delete this property? This will also delete all
                  associated units, tenant links, and maintenance requests. This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteLoading ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Properties Grid / List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : properties.length === 0 && !showForm ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="w-12 h-12 text-slate-200" />
          <p className="text-lg font-medium text-slate-400 mt-3">No properties yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Add your first property to start managing it with RentWise.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl px-6 py-2.5 flex items-center gap-2 mt-4 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>
      ) : !showForm ? (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-400 mt-3">
                No properties match your search
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setJurisdictionFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onEdit={() => startEdit(p)}
                  onDelete={() => {
                    setDeletingId(p.id);
                    setOpenMenuId(null);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <PropertyListRow
                  key={p.id}
                  property={p}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onEdit={() => startEdit(p)}
                  onDelete={() => {
                    setDeletingId(p.id);
                    setOpenMenuId(null);
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

/* ═══════════ Property Card Component ═══════════ */

function PropertyCard({
  property: p,
  openMenuId,
  setOpenMenuId,
  onEdit,
  onDelete,
}: {
  property: PropertyRow;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOccupied = (p.activeTenants ?? 0) > 0;
  const fullAddress = [p.address, p.city, p.state, p.zipCode].filter(Boolean).join(", ");
  const jColors = jurisdictionColors[p.jurisdiction] ?? jurisdictionColors.dc;

  const emergHoursRemaining = p.emergencyDetail?.legalDeadline
    ? getHoursRemaining(p.emergencyDetail.legalDeadline)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
      {/* Top section */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${jColors}`}
        >
          {jurisdictionLabels[p.jurisdiction] ?? p.jurisdiction}
        </span>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === p.id ? null : p.id);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {openMenuId === p.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                <button
                  onClick={onEdit}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Property
                </button>
                <button
                  onClick={onDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Property
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name + Address */}
      <h3 className="text-lg font-semibold text-slate-900 mt-3">
        {p.name || p.address}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mt-1">{fullAddress}</p>

      {/* Divider */}
      <div className="border-t border-slate-100 my-4" />

      {/* Bottom health stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Units */}
        <div>
          <p className="text-lg font-bold text-slate-900">{p.unitCount}</p>
          <p className="text-xs text-slate-400">
            Unit{p.unitCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Occupancy */}
        <div>
          <div className="flex items-center justify-center gap-1.5">
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
        </div>

        {/* Requests */}
        <div>
          <p
            className={`text-lg font-bold ${
              (p.openRequests ?? 0) > 0 ? "text-red-600" : "text-slate-300"
            }`}
          >
            {p.openRequests ?? 0}
          </p>
          <p className="text-xs text-slate-400">
            {(p.openRequests ?? 0) > 0 ? "Open" : "Requests"}
          </p>
        </div>
      </div>

      {/* Alert bar (if applicable) */}
      {(p.emergencyRequests ?? 0) > 0 && p.emergencyDetail && (() => {
        const urg = p.emergencyDetail?.urgency ?? "emergency";
        const deadlineInfo = LEGAL_DEADLINES[p.jurisdiction]?.[urg] ?? LEGAL_DEADLINES.dc[urg];
        return (
          <div className="bg-red-50 rounded-lg px-3 py-2 mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-xs text-red-600 font-medium">
                Emergency {p.emergencyDetail!.category.toLowerCase()} report
                {emergHoursRemaining !== null && ` \u2014 response due in ${emergHoursRemaining}hrs`}
              </span>
            </div>
            {deadlineInfo && (
              <p className="text-[11px] text-red-500 pl-5.5 ml-[22px]">
                Per {deadlineInfo.shortCite}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════ Property List Row Component ═══════════ */

function PropertyListRow({
  property: p,
  openMenuId,
  setOpenMenuId,
  onEdit,
  onDelete,
}: {
  property: PropertyRow;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOccupied = (p.activeTenants ?? 0) > 0;
  const fullAddress = [p.address, p.city, p.state, p.zipCode].filter(Boolean).join(", ");
  const jColors = jurisdictionColors[p.jurisdiction] ?? jurisdictionColors.dc;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Home className="w-5 h-5 text-blue-600" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {p.name || p.address}
          </h3>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${jColors}`}
          >
            {jurisdictionLabels[p.jurisdiction] ?? p.jurisdiction}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{fullAddress}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{p.unitCount}</p>
          <p className="text-[11px] text-slate-400">Units</p>
        </div>
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
        {(p.openRequests ?? 0) > 0 && (
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-600">
              {p.openRequests} open
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(openMenuId === p.id ? null : p.id);
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {openMenuId === p.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
            <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
              <button
                onClick={onEdit}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Property
              </button>
              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Property
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
