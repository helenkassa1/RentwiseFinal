"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/shared";
import {
  Building2,
  Plus,
  X,
  Loader2,
  MapPin,
  Home,
  Trash2,
} from "lucide-react";

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
};

type UnitDraft = {
  identifier: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  rentAmount: string;
  isVoucherUnit: boolean;
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
  pg_county: "Prince George\u2019s County",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [propertyType, setPropertyType] = useState("residential");
  const [unitDrafts, setUnitDrafts] = useState<UnitDraft[]>([{ ...emptyUnit, identifier: "Unit 1" }]);

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
  }

  function addUnit() {
    setUnitDrafts((prev) => [
      ...prev,
      { ...emptyUnit, identifier: `Unit ${prev.length + 1}` },
    ]);
  }

  function removeUnit(idx: number) {
    setUnitDrafts((prev) => prev.filter((_, i) => i !== idx));
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

    try {
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
            .filter((u) => u.identifier.trim())
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
      await fetchProperties();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        )}
      </div>

      {/* ── Add Property Form ── */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add New Property</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowForm(false); resetForm(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Property Name <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="e.g. Sunset Apartments"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="mixed">Mixed Use</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="DC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="20001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jurisdiction <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm"
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
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Units
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addUnit}>
                    <Plus className="mr-1 h-3 w-3" /> Add Unit
                  </Button>
                </div>

                {unitDrafts.map((unit, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Unit {idx + 1}</span>
                      {unitDrafts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeUnit(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <div>
                        <label className="block text-xs font-medium mb-1">Name/ID</label>
                        <input
                          type="text"
                          value={unit.identifier}
                          onChange={(e) => updateUnit(idx, "identifier", e.target.value)}
                          className="w-full rounded-md border px-2 py-1.5 text-sm"
                          placeholder="Unit 1A"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Bedrooms</label>
                        <input
                          type="number"
                          min="0"
                          value={unit.bedrooms}
                          onChange={(e) => updateUnit(idx, "bedrooms", e.target.value)}
                          className="w-full rounded-md border px-2 py-1.5 text-sm"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Bathrooms</label>
                        <input
                          type="text"
                          value={unit.bathrooms}
                          onChange={(e) => updateUnit(idx, "bathrooms", e.target.value)}
                          className="w-full rounded-md border px-2 py-1.5 text-sm"
                          placeholder="1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Sq Ft</label>
                        <input
                          type="number"
                          min="0"
                          value={unit.squareFeet}
                          onChange={(e) => updateUnit(idx, "squareFeet", e.target.value)}
                          className="w-full rounded-md border px-2 py-1.5 text-sm"
                          placeholder="850"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Rent ($/mo)</label>
                        <input
                          type="text"
                          value={unit.rentAmount}
                          onChange={(e) => updateUnit(idx, "rentAmount", e.target.value)}
                          className="w-full rounded-md border px-2 py-1.5 text-sm"
                          placeholder="1500.00"
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={unit.isVoucherUnit}
                            onChange={(e) => updateUnit(idx, "isVoucherUnit", e.target.checked)}
                            className="rounded border"
                          />
                          Voucher
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? "Creating..." : "Create Property"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); resetForm(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Properties List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : properties.length === 0 && !showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Your Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No properties added yet. Click &quot;Add Property&quot; to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-tight">
                      {p.name || p.address}
                    </h3>
                    {p.name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {p.address}
                      </p>
                    )}
                  </div>
                  <Badge variant="blue">
                    {jurisdictionLabels[p.jurisdiction] ?? p.jurisdiction}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    {p.unitCount} {p.unitCount === 1 ? "unit" : "units"}
                  </span>
                  {p.city && p.state && (
                    <span>
                      {p.city}, {p.state} {p.zipCode}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
