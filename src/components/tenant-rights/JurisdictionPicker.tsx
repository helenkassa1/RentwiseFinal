"use client";

import { Button } from "@/components/ui/button";
import { JURISDICTION_LABELS, type Jurisdiction } from "@/lib/tenant-rights/types";
import { trackTenantRights } from "@/lib/tenant-rights/analytics";
import { MapPin } from "lucide-react";

const JURISDICTIONS: Jurisdiction[] = ["dc", "pg"];

export function JurisdictionPicker({
  value,
  onChange,
  showChangeLink = false,
}: {
  value: Jurisdiction | null;
  onChange: (j: Jurisdiction | null) => void;
  showChangeLink?: boolean;
}) {
  return (
    <section
      aria-labelledby="jurisdiction-heading"
      className="space-y-4"
    >
      <h2 id="jurisdiction-heading" className="text-2xl font-bold">
        Where do you live?
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {JURISDICTIONS.map((j) => (
          <Button
            key={j}
            type="button"
            variant={value === j ? "default" : "outline"}
            size="lg"
            className="h-auto min-h-[80px] flex-col gap-2 py-6 text-left"
            onClick={() => {
              onChange(j);
              trackTenantRights({ name: "jurisdiction_selected", jurisdiction: j });
            }}
            aria-pressed={value === j}
            aria-label={`Select ${JURISDICTION_LABELS[j]}`}
          >
            <MapPin className="h-6 w-6 shrink-0" aria-hidden />
            <span className="font-semibold">{JURISDICTION_LABELS[j]}</span>
          </Button>
        ))}
      </div>
      {showChangeLink && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          aria-label="Change jurisdiction"
        >
          Change
        </button>
      )}
    </section>
  );
}
