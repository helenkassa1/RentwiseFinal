"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Building2,
  FileText,
  Wrench,
  ClipboardCheck,
  Bell,
  Scale,
  Users,
  Settings,
  Briefcase,
} from "lucide-react";

const landlordPmLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/leases", label: "Leases", icon: FileText },
  { href: "/lease-review", label: "Lease Review", icon: Scale },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/inspections", label: "Inspections", icon: ClipboardCheck },
  { href: "/dashboard/tenants", label: "Tenants", icon: Users },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const tenantLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/dashboard/leases", label: "My lease", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const [role, setRole] = useState<string>("landlord");

  useEffect(() => {
    fetch("/api/dashboard/portal")
      .then((res) => res.json())
      .then((data) => {
        if (data.role) setRole(data.role);
      })
      .catch(() => {});
  }, []);

  const isPM = role === "property_manager";
  const isTenant = role === "tenant";
  const links = isTenant
    ? tenantLinks
    : isPM
      ? [
          ...landlordPmLinks.slice(0, 2),
          { href: "/dashboard/clients", label: "Clients", icon: Briefcase },
          ...landlordPmLinks.slice(2),
        ]
      : landlordPmLinks;

  return (
    <nav className="space-y-1 p-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
