"use client";

import React from "react";
import type { UserRole } from "@/lib/portal/types";

function roleLabel(role: UserRole): string {
  if (role === "tenant") return "Tenant Portal";
  if (role === "property_manager") return "Property Manager Portal";
  return "Landlord Portal";
}

export function PortalHeader(props: {
  role: UserRole;
  canSwitchRoles?: boolean;
  onSwitchRole?: (role: UserRole) => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{roleLabel(props.role)}</h1>
        <p className="text-sm text-muted-foreground">
          {props.role === "tenant"
            ? "View your unit, lease, and submit maintenance requests."
            : "Manage properties, tenants, maintenance, compliance, and leasing in one place."}
        </p>
      </div>

      {props.role !== "tenant" && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            {props.role === "property_manager" ? "PM Mode" : "Landlord Mode"}
          </span>
          {props.canSwitchRoles && (
            <select
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={props.role}
              onChange={(e) =>
                props.onSwitchRole?.(e.target.value as UserRole)
              }
              aria-label="Switch portal mode"
            >
              <option value="landlord">Landlord</option>
              <option value="property_manager">Property Manager</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}
