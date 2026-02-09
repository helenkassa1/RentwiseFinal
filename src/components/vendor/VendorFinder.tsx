"use client";

import React, { useMemo, useState } from "react";
import type { Jurisdiction, Trade, VendorResult } from "@/lib/vendors/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TRADES: Array<{ id: Trade; label: string }> = [
  { id: "plumbing", label: "Plumbing" },
  { id: "hvac", label: "HVAC" },
  { id: "electrical", label: "Electrical" },
  { id: "handyman", label: "Handyman" },
  { id: "pest", label: "Pest Control" },
  { id: "locksmith", label: "Locksmith" },
  { id: "cleaning", label: "Cleaning" },
  { id: "general", label: "General" },
];

function badge(status: VendorResult["licenseStatus"]) {
  if (status === "verified") return "Licensed (Verified)";
  if (status === "not_provided") return "License not provided";
  if (status === "unverified") return "Not verified";
  return "—";
}

export function VendorFinder(props: {
  jurisdiction: Jurisdiction;
  defaultLocationText: string;
  propertyId: string;
}) {
  const [trade, setTrade] = useState<Trade>("plumbing");
  const [locationText, setLocationText] = useState(props.defaultLocationText);
  const [includeUnverified, setIncludeUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VendorResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [issueText, setIssueText] = useState("");
  const [triage, setTriage] = useState<{
    suggestedTrade: string;
    suggestedTradeLabel: string;
    urgency: string;
    askFor: string;
    messageTemplate: string;
  } | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          `vendor_search:${props.propertyId}`,
          JSON.stringify({ trade, locationText, includeUnverified })
        );
      }
      const res = await fetch("/api/vendors/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction: props.jurisdiction,
          trade,
          locationText,
          includeUnverified,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");
      setResults(data.results || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function runTriage() {
    if (!issueText.trim()) return;
    setTriageLoading(true);
    setTriage(null);
    try {
      const res = await fetch("/api/ai/vendor-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction: props.jurisdiction,
          propertyId: props.propertyId,
          issueText,
        }),
      });
      const data = await res.json();
      setTriage(data);
      if (data?.suggestedTrade) setTrade(data.suggestedTrade as Trade);
    } finally {
      setTriageLoading(false);
    }
  }

  async function requestQuote(vendor: VendorResult) {
    setQuoteSaved(null);
    try {
      const res = await fetch("/api/vendor-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: props.propertyId,
          vendorId: vendor.id,
          vendorName: vendor.name,
          trade,
          issueText: issueText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setQuoteSaved(vendor.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save quote request");
    }
  }

  const warningText = useMemo(() => {
    if (!includeUnverified) {
      return "Showing only Licensed (Verified) vendors by default. Toggle to show more results (not recommended).";
    }
    return "Warning: Unverified vendors may not meet licensing requirements. Verify license before hiring.";
  }, [includeUnverified]);

  return (
    <div className="space-y-5">
      {/* AI helper */}
      <Card>
        <CardContent className="pt-6">
          <div className="font-semibold">AI helper (optional)</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the issue. We&apos;ll suggest the right vendor type and a message template.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <textarea
              className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder='e.g. "Water leaking under the sink. Mold smell. Been 3 days."'
            />
            <Button
              onClick={runTriage}
              disabled={!issueText.trim() || triageLoading}
              variant="outline"
            >
              {triageLoading ? "Thinking..." : "Suggest vendor"}
            </Button>
          </div>
          {triage && (
            <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="font-semibold">Suggestion</div>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                <li>
                  <b>Suggested vendor type:</b> {triage.suggestedTradeLabel}
                </li>
                <li>
                  <b>Urgency:</b> {triage.urgency}
                </li>
                <li>
                  <b>Ask the vendor for:</b> {triage.askFor}
                </li>
              </ul>
              <div className="mt-3">
                <div className="font-semibold">Message template</div>
                <pre className="mt-1 whitespace-pre-wrap rounded-md bg-background p-3 text-xs">
                  {triage.messageTemplate}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-semibold">Find a licensed vendor</div>
              <p className="text-sm text-muted-foreground">
                We filter to show compliant, verified vendors by default.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeUnverified}
                onChange={(e) => setIncludeUnverified(e.target.checked)}
                className="rounded border-input"
              />
              Show unverified (not recommended)
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{warningText}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Job type</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={trade}
                onChange={(e) => setTrade(e.target.value as Trade)}
              >
                {TRADES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Search near</label>
              <Input
                className="mt-1"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Property address or ZIP"
              />
            </div>
          </div>
          <Button
            className="mt-3"
            onClick={search}
            disabled={loading || !locationText.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Results</div>
          <span className="text-xs text-muted-foreground">
            {results.length} shown
          </span>
        </div>
        {results.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No results yet. Try searching. (Default view only shows{" "}
              <b>Licensed Verified</b> vendors.)
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {badge(v.licenseStatus)}
                      </div>
                      {v.licenseNotes && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {v.licenseNotes}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">
                      {v.source}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {v.rating != null ? (
                      <span>
                        {v.rating} {v.reviewCount != null ? `(${v.reviewCount} reviews)` : ""}
                      </span>
                    ) : (
                      <span>No rating provided</span>
                    )}
                    {v.address && (
                      <div className="mt-1">{v.address}</div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {v.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${v.phone}`}>Call</a>
                      </Button>
                    )}
                    {v.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={v.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Website
                        </a>
                      </Button>
                    )}
                    {v.mapsUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={v.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Maps
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requestQuote(v)}
                    >
                      {quoteSaved === v.id ? "Quote request saved" : "Request quote"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card>
          <CardContent className="py-3 text-xs text-muted-foreground">
            <b>How we verify:</b> We prioritize licensed vendors. If a license
            number is missing or can&apos;t be verified automatically, we mark
            the vendor as unverified so you can verify through the official
            registry before hiring.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
