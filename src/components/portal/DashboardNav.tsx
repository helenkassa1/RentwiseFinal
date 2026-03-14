"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  Home,
  CreditCard,
  MessageSquare,
  FileSearch,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  links: NavLink[];
};

const landlordGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MANAGE",
    links: [
      { href: "/dashboard/properties", label: "Properties", icon: Building2 },
      { href: "/dashboard/leases", label: "Leases", icon: FileText },
      { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
      { href: "/dashboard/tenants", label: "Tenants", icon: Users },
      { href: "/dashboard/inspections", label: "Inspections", icon: ClipboardCheck },
    ],
  },
  {
    label: "AI TOOLS",
    links: [
      { href: "/lease-review", label: "Lease Review", icon: FileSearch },
      { href: "/tenant-rights", label: "Legal Assistant", icon: Scale },
    ],
  },
];

const tenantLinks: NavLink[] = [
  { href: "/tenant", label: "My Home", icon: Home },
  { href: "/tenant/payments", label: "Payments", icon: CreditCard },
  { href: "/tenant/lease", label: "Lease & Rights", icon: FileText },
  { href: "/tenant/requests", label: "Requests", icon: Wrench },
  { href: "/tenant/messages", label: "Messages", icon: MessageSquare },
];

const bottomLinks: NavLink[] = [
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("landlord");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard/portal")
      .then((res) => res.json())
      .then((data) => {
        if (data.role) setRole(data.role);
        if (data.summary?.unreadMessages) setNotifCount(data.summary.unreadMessages);
      })
      .catch(() => {});
  }, []);

  const isTenant = role === "tenant";

  if (isTenant) {
    return (
      <nav className="space-y-1 p-4">
        {tenantLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Main grouped navigation */}
      <nav className="flex-1 px-3 pt-4 overflow-y-auto">
        {landlordGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-6" : ""}>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-2 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <link.icon
                      className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-100">
        {bottomLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const isNotif = link.label === "Notifications";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon
                className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
              />
              {link.label}
              {isNotif && notifCount > 0 && (
                <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
