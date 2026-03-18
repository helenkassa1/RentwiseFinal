"use client";

import Link from "next/link";
import {
  Lock,
  ArrowRight,
  Crown,
  UserPlus,
  X,
  Users,
} from "lucide-react";

type GateReason =
  | "anonymous_limit"
  | "monthly_limit"
  | "plan_required"
  | "auth_required";

interface AccessGateProps {
  reason: GateReason;
  feature?: string;
  onClose?: () => void;
}

const GATE_CONFIG = {
  anonymous_limit: {
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "You\u2019ve used your free review",
    description:
      "Create a free account to continue using the Lease Review tool. Tenant accounts get unlimited reviews \u2014 always free.",
    primaryCta: { text: "Create Free Account", href: "/sign-up" },
    secondaryCta: { text: "Sign In", href: "/sign-in" },
    showTenantNote: true,
  },
  monthly_limit: {
    icon: Crown,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Monthly review limit reached",
    description:
      "You\u2019ve used your 2 free lease reviews this month. Upgrade to Landlord Pro for unlimited reviews, plus Section 8 tools, contractor recommendations, and more.",
    primaryCta: { text: "Upgrade to Pro \u2014 $15/mo", href: "/pricing" },
    secondaryCta: { text: "View All Plans", href: "/pricing" },
    showTenantNote: false,
  },
  plan_required: {
    icon: Lock,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "This feature requires a Pro plan",
    description:
      "Upgrade to Landlord Pro to access the full Section 8 Voucher Navigator, contractor recommendations, and unlimited lease reviews.",
    primaryCta: { text: "Upgrade to Pro \u2014 $15/mo", href: "/pricing" },
    secondaryCta: { text: "View All Plans", href: "/pricing" },
    showTenantNote: false,
  },
  auth_required: {
    icon: Lock,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    title: "Sign in to continue",
    description:
      "You need an account to access this feature. It\u2019s free to get started.",
    primaryCta: { text: "Create Free Account", href: "/sign-up" },
    secondaryCta: { text: "Sign In", href: "/sign-in" },
    showTenantNote: false,
  },
};

export function AccessGate({ reason, feature, onClose }: AccessGateProps) {
  const config = GATE_CONFIG[reason];
  const Icon = config.icon;

  // Override title with feature name if provided
  const title =
    feature && reason === "plan_required"
      ? `${feature} requires a Pro plan`
      : feature && reason === "auth_required"
        ? `Sign in to access ${feature}`
        : config.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        style={{ animation: "fadeInScale 0.2s ease-out" }}
      >
        {/* Close button — only show if onClose is provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto`}
        >
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 text-center mt-5">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
          {config.description}
        </p>

        {/* Tenant note — only for anonymous_limit */}
        {config.showTenantNote && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                <span className="font-semibold">Are you a tenant?</span> Create
                a free tenant account for unlimited lease reviews. Always free
                &mdash; no credit card, no catch.
              </p>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="mt-6 space-y-3">
          <Link
            href={config.primaryCta.href}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-bold transition-all"
          >
            {config.primaryCta.text}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={config.secondaryCta.href}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-all"
          >
            {config.secondaryCta.text}
          </Link>
        </div>

        {/* Bottom disclaimer */}
        <p className="text-[10px] text-slate-400 text-center mt-5 leading-relaxed">
          Tenant Rights Portal is always free. No login required.
        </p>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// Also export a simple inline banner version for non-modal use cases
export function AccessBanner({
  reason,
  feature,
}: {
  reason: GateReason;
  feature?: string;
}) {
  const config = GATE_CONFIG[reason];
  void feature;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
      <Crown className="w-8 h-8 text-amber-500 mx-auto" />
      <h3 className="text-base font-bold text-slate-900 mt-3">
        {config.title}
      </h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
        {config.description}
      </p>
      <div className="flex gap-3 justify-center mt-4">
        <Link
          href={config.primaryCta.href}
          className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {config.primaryCta.text} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
