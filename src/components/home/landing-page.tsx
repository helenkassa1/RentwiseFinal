"use client";

// PRESERVED FUNCTIONALITY:
// - Link to /lease-review (hero primary CTA — was green banner)
// - Link to /tenant-rights (hero secondary CTA — was Ask Question)
// - Link to /signup?type=landlord (persona/how-it-works — Landlord Get Started)
// - Link to /signup?type=tenant (persona/how-it-works — Tenant Get Started)
// - Link to /signup?type=property-manager (how-it-works — PM Get Started)
// - Link to /pricing (features — See Plans)
// - Link to /voucher-navigation (voucher section — Learn More)
// - Link to /signup?type=landlord (final CTA — Start Free Trial)
// - Link to /signup?type=tenant (final CTA — Access Free Tools)
// - Footer links: /privacy, /terms, /contact
// - PostHog analytics capture (removed — was in accordion onChange)

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  MessageCircle,
  Scale,
  UserCheck,
  Shield,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Upload,
  Zap,
  Building2,
  Search,
  LayoutDashboard,
  FileCheck,
  Sparkles,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   HERO CAROUSEL — Product preview slides
   ═══════════════════════════════════════════════════════════ */

const SLIDE_URLS = [
  "rentwise.ai/lease-review",
  "rentwise.ai/rights-assistant",
  "rentwise.ai/dashboard",
  "rentwise.ai/vouchers",
];

const SLIDE_BADGES = [
  { icon: AlertTriangle, iconClass: "text-red-500", bgClass: "bg-red-50", title: "17 issues found", sub: "in under 2 minutes" },
  { icon: MessageCircle, iconClass: "text-emerald-600", bgClass: "bg-emerald-50", title: "Free for all tenants", sub: "DC & MD housing codes" },
  { icon: ShieldCheck, iconClass: "text-blue-600", bgClass: "bg-blue-50", title: "96% compliance score", sub: "across all properties" },
  { icon: FileCheck, iconClass: "text-blue-600", bgClass: "bg-blue-50", title: "AI-guided forms", sub: "DCHA & HAPGC ready" },
];

const SLIDE_TABS = [
  { icon: FileSearch, label: "Lease Review" },
  { icon: MessageCircle, label: "Tenant Rights" },
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FileCheck, label: "Section 8" },
];

function SlideLeaseReview() {
  return (
    <div className="flex h-full">
      <div className="flex-1 p-5 border-r border-slate-100 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[9px] font-bold text-red-600">14 Prohibited</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] font-bold text-amber-600">3 Risky</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full ml-auto">
            <span className="text-[9px] font-semibold text-emerald-600">~2.5 hrs saved</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="h-2 bg-slate-200 rounded-full w-[85%]" />
          <div className="h-2 bg-slate-200 rounded-full w-[70%]" />
          <div className="h-2 bg-slate-100 rounded-full w-[90%]" />
          <div className="bg-red-100 rounded-md p-2 border-l-2 border-red-400">
            <div className="h-2 bg-red-200 rounded-full w-[95%]" />
            <div className="h-2 bg-red-200 rounded-full w-[60%] mt-1.5" />
          </div>
          <div className="h-2 bg-slate-100 rounded-full w-[75%]" />
          <div className="h-2 bg-slate-200 rounded-full w-[88%]" />
          <div className="bg-amber-100 rounded-md p-2 border-l-2 border-amber-400">
            <div className="h-2 bg-amber-200 rounded-full w-[80%]" />
            <div className="h-2 bg-amber-200 rounded-full w-[45%] mt-1.5" />
          </div>
          <div className="h-2 bg-slate-100 rounded-full w-[65%]" />
        </div>
      </div>
      <div className="w-[180px] bg-slate-50 p-3 overflow-hidden">
        <div className="text-[10px] font-bold text-slate-700 mb-3">Suggestions (17)</div>
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-[8px] font-bold flex items-center justify-center">1</span>
              <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">Prohibited</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-800 leading-snug">Illegal waiver of landlord liability</div>
            <div className="text-[8px] text-slate-400 mt-1">14 DCMR &sect; 304</div>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-[8px] font-bold flex items-center justify-center">2</span>
              <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">Prohibited</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-800 leading-snug">Excessive late fee ($150)</div>
            <div className="text-[8px] text-slate-400 mt-1">DC Code &sect; 42-3505</div>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[8px] font-bold flex items-center justify-center">3</span>
              <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">Missing</span>
            </div>
            <div className="text-[9px] font-semibold text-slate-800 leading-snug">Lead paint disclosure</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideTenantRights() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-800">Rights Assistant</div>
          <div className="text-[9px] text-slate-400">Prince George&apos;s County, MD</div>
        </div>
        <span className="ml-auto text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">FREE</span>
      </div>
      <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
        <div className="flex justify-end">
          <div className="bg-[#1e3a5f] text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[75%]">
            <p className="text-[11px] leading-relaxed">My landlord hasn&apos;t fixed a leak for 2 weeks. What can I do?</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] border border-slate-200">
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Under <span className="font-semibold text-blue-600">MD Code &sect; 8-211</span>, your landlord has an implied warranty to maintain habitable conditions. For non-emergency repairs, Maryland law requires action within a reasonable time.
            </p>
            <div className="mt-2.5 bg-emerald-50 rounded-lg p-2.5 border border-emerald-200">
              <div className="text-[9px] font-bold text-emerald-700 mb-1">Your next steps:</div>
              <div className="space-y-1">
                {["Send written repair request via certified mail", "Document with dated photos", "File for rent escrow if unresolved"].map((step, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-200 text-emerald-700 text-[8px] font-bold flex items-center justify-center">{i + 1}</div>
                    <span className="text-[9px] text-emerald-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
        <div className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-[10px] text-slate-400">Ask about your rights...</div>
        <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
          <ArrowUp className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SlideDashboard() {
  return (
    <div className="p-5 h-full overflow-hidden">
      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-4">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        <span className="text-[9px] font-semibold text-red-700">Emergency request: Mold at Bowie House &mdash; respond within 24hrs</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Properties", value: "2", color: "text-slate-900", border: "" },
          { label: "Tenants", value: "3", color: "text-slate-900", border: "" },
          { label: "Open Requests", value: "1", color: "text-red-600", border: "border-red-200 bg-red-50/30" },
          { label: "Compliance", value: "96%", color: "text-emerald-600", border: "" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-lg border border-slate-200 p-2.5 ${s.border}`}>
            <div className="text-[9px] text-slate-400">{s.label}</div>
            <div className={`text-base font-bold mt-0.5 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-[10px] font-bold text-slate-700 mb-2">Your Properties</div>
          <div className="space-y-2">
            {[
              { name: "Bowie House", loc: "Bowie, MD", tag: "PG County", tagClass: "bg-blue-50 text-blue-600" },
              { name: "DC Condo", loc: "Washington, DC", tag: "DC", tagClass: "bg-violet-50 text-violet-600" },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-[10px] font-semibold text-slate-800">{p.name}</div>
                  <div className="text-[8px] text-slate-400">{p.loc}</div>
                </div>
                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${p.tagClass}`}>{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white">
            <div className="text-[10px] font-bold">AI Lease Review</div>
            <div className="text-[8px] text-blue-200 mt-0.5">2 leases &mdash; last checked 3d ago</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-3 text-white">
            <div className="text-[10px] font-bold">Legal Assistant</div>
            <div className="text-[8px] text-emerald-200 mt-0.5">Ask any housing law question</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideVoucher() {
  return (
    <div className="p-5 h-full overflow-hidden">
      <div className="flex items-center gap-1.5 mb-4">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className="contents">
            <div className={`w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center ${n <= 2 ? "bg-[#1e3a5f] text-white" : "bg-slate-200 text-slate-400"}`}>{n}</div>
            {n < 4 && <div className={`h-0.5 w-6 rounded-full ${n < 2 ? "bg-[#1e3a5f]" : "bg-slate-200"}`} />}
          </span>
        ))}
        <span className="ml-2 text-[9px] text-slate-400">Step 2 of 7: Owner Info</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[9px] font-semibold text-slate-600 mb-1 block">Owner / Agent Name</label>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] text-slate-700">Helen Landlord</div>
        </div>
        <div>
          <label className="text-[9px] font-semibold text-slate-600 mb-1 block">Entity Type</label>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] text-slate-700">Individual</div>
        </div>
        <div className="col-span-2">
          <label className="text-[9px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            Mailing Address
            <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 text-[7px] font-bold flex items-center justify-center">i</span>
          </label>
          <div className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-[10px] text-slate-700 ring-2 ring-blue-100">12218 Quintette Lane, Bowie, MD 20720</div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="text-[9px] font-bold text-blue-700">AI Guidance</span>
        </div>
        <p className="text-[9px] text-blue-600 leading-relaxed">
          Use your legal name exactly as it appears on the property deed. If you&apos;re using an LLC, enter the LLC name and provide your EIN on the next field.
        </p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-[9px] text-slate-400">Auto-saved</span>
        <div className="flex gap-2">
          <div className="text-[9px] text-slate-500 px-3 py-1.5 border border-slate-200 rounded-lg">Back</div>
          <div className="text-[9px] text-white bg-[#1e3a5f] px-3 py-1.5 rounded-lg font-semibold">Next &rarr;</div>
        </div>
      </div>
    </div>
  );
}

const SLIDE_COMPONENTS = [SlideLeaseReview, SlideTenantRights, SlideDashboard, SlideVoucher];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((p) => (p + 1) % 4);
      setProgressKey((k) => k + 1);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!paused) startTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, startTimer]);

  const handleTab = (i: number) => {
    setActive(i);
    setProgressKey((k) => k + 1);
    if (!paused) startTimer();
  };

  const badge = SLIDE_BADGES[active];
  const BadgeIcon = badge.icon;

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fix 5: Browser frame with deeper shadow + subtle tilt */}
      <div className="bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(15,23,42,0.18)] border border-slate-200/80 overflow-hidden transform rotate-[0.5deg] hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-slate-400 text-center border border-slate-200 font-mono">
            {SLIDE_URLS[active]}
          </div>
        </div>

        {/* Slide content — crossfade */}
        <div className="relative h-[340px] overflow-hidden bg-white">
          {SLIDE_COMPONENTS.map((SlideComp, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ${active === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <SlideComp />
            </div>
          ))}
        </div>
      </div>

      {/* Fix 4: Tab indicators — more breathing room, clear separation from badge */}
      <div className="flex gap-2 mt-8 justify-center flex-wrap">
        {SLIDE_TABS.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = active === i;
          return (
            <button
              key={i}
              onClick={() => handleTab(i)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all overflow-hidden ${
                isActive
                  ? "bg-[#1e3a5f] text-white font-semibold shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {/* Progress bar under active tab */}
              {isActive && (
                <span
                  key={progressKey}
                  className="absolute bottom-0 left-0 h-[2px] bg-white/40 rounded-full"
                  style={{ animation: "fillProgress 5s linear forwards" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Fix 4: Floating badge — moved to top-left to avoid tab overlap */}
      <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 hidden sm:flex items-center gap-3 z-20">
        <div className={`w-10 h-10 rounded-full ${badge.bgClass} flex items-center justify-center`}>
          <BadgeIcon className={`w-5 h-5 ${badge.iconClass}`} />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">{badge.title}</div>
          <div className="text-xs text-slate-500">{badge.sub}</div>
        </div>
      </div>

      {/* CSS keyframe for progress bar */}
      <style jsx>{`
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — Two-column: Text left, product screenshot right
   ═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.15]" />
      {/* Fix 1: Radial glow behind carousel area */}
      <div
        className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(191,219,254,0.35) 0%, rgba(219,234,254,0.12) 50%, transparent 80%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left column — Text (Fix 2: tighter spacing) */}
        <div className="hero-stagger">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 border border-navy/10 text-navy text-sm font-medium mb-5 hero-fade-item">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-powered for DC &amp; Maryland law
          </span>

          <h1
            className="text-4xl md:text-5xl leading-[1.1] text-slate-900 hero-fade-item"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The legal intelligence your rental property has been missing.
          </h1>

          <p className="text-lg text-slate-500 mt-5 leading-relaxed max-w-lg hero-fade-item">
            RentWise reviews leases for compliance, helps tenants understand
            their rights, and keeps landlords on the right side of DC and
            Maryland housing law&nbsp;&mdash; all powered by AI.
          </p>

          {/* CTAs — PRESERVED destinations: /lease-review and /tenant-rights */}
          <div className="flex flex-col sm:flex-row gap-3 mt-7 hero-fade-item">
            <Link
              href="/lease-review"
              className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-7 py-3.5 rounded-xl text-base shadow-lg shadow-navy/15 transition-all active:scale-[0.98]"
            >
              Review Your Lease Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tenant-rights"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
            >
              Explore Tenant Rights <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400 mt-6 hero-fade-item">
            {["No account needed", "Free for tenants", "Not legal advice"].map(
              (t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {t}
                </span>
              )
            )}
          </div>

          {/* Fix 3: Section 8 callout — white/glass treatment */}
          <div className="mt-5 pt-5 border-t border-slate-200/60 hero-fade-item">
            <Link
              href="/voucher-navigation"
              className="group flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-5 py-3.5 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all duration-300 max-w-lg"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-4.5 h-4.5 text-[#1e3a5f]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Accepting Section 8 tenants?</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">NEW</span>
                </div>
                <span className="text-xs text-slate-500">AI-guided DCHA application with HQS inspection prep</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Right column — Product carousel (Fix 7: entrance animation) */}
        <div className="hero-fade-carousel">
          <HeroCarousel />
        </div>
      </div>

      {/* Fix 7: Entrance animation keyframes */}
      <style jsx>{`
        .hero-stagger .hero-fade-item {
          opacity: 0;
          transform: translateY(18px);
          animation: heroFadeInUp 0.6s ease-out forwards;
        }
        .hero-stagger .hero-fade-item:nth-child(1) { animation-delay: 0.05s; }
        .hero-stagger .hero-fade-item:nth-child(2) { animation-delay: 0.12s; }
        .hero-stagger .hero-fade-item:nth-child(3) { animation-delay: 0.19s; }
        .hero-stagger .hero-fade-item:nth-child(4) { animation-delay: 0.26s; }
        .hero-stagger .hero-fade-item:nth-child(5) { animation-delay: 0.33s; }
        .hero-stagger .hero-fade-item:nth-child(6) { animation-delay: 0.40s; }
        .hero-fade-carousel {
          opacity: 0;
          transform: translateY(24px);
          animation: heroFadeInUp 0.7s ease-out 0.3s forwards;
        }
        @keyframes heroFadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   THREE PILLARS — Replaces old features + persona cards
   ═══════════════════════════════════════════════════════════ */
function ThreePillars() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            What RentWise Does
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-slate-900 mt-2"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Three tools. One mission.
          </h2>
          <p className="text-lg text-slate-500 mt-3">
            Legal compliance shouldn&rsquo;t require a law degree. We built the
            tools that DC and Maryland&rsquo;s rental market has been missing.
          </p>
        </div>

        {/* ── PILLAR 1: LEASE REVIEW ── */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              LEASE REVIEW TOOL
            </span>
            <h3
              className="text-2xl md:text-3xl font-bold text-slate-900 mt-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Upload your lease. See every problem.
            </h3>
            <p className="text-base text-slate-500 leading-relaxed mt-3">
              Our AI reads every clause and checks it against current DC and
              Maryland housing codes. Illegal waivers, excessive fees, missing
              disclosures&nbsp;&mdash; each flagged with the specific statute it
              violates and a plain-English explanation.
            </p>
            <div className="mt-6 space-y-3">
              {[
                {
                  icon: XCircle,
                  bg: "bg-red-50",
                  color: "text-red-500",
                  title: "Flags prohibited clauses",
                  desc: "Waivers of liability, illegal eviction terms, jury trial waivers",
                },
                {
                  icon: AlertTriangle,
                  bg: "bg-amber-50",
                  color: "text-amber-500",
                  title: "Identifies missing disclosures",
                  desc: "Lead paint, mold, flood zone \u2014 required but often forgotten",
                },
                {
                  icon: CheckCircle2,
                  bg: "bg-emerald-50",
                  color: "text-emerald-500",
                  title: "Suggests compliant replacements",
                  desc: "Each issue comes with suggested language you can accept",
                },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <b.icon className={`w-4 h-4 ${b.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {b.title}
                    </p>
                    <p className="text-sm text-slate-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* PRESERVED: /lease-review destination */}
            <Link
              href="/lease-review"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mt-6"
            >
              Try the Lease Review Tool &mdash; Free{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Right — visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-[10px] text-slate-400 text-center border border-slate-200">
                  rentwise.ai/lease-review
                </div>
              </div>
              {/* Mock suggestions panel */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-white space-y-3">
                {[
                  { num: "1", sev: "red", title: "Illegal waiver of liability", code: "DC Code \u00A7 42-3505.01" },
                  { num: "2", sev: "red", title: "Excessive late fee ($150)", code: "MD Code \u00A7 8-208" },
                  { num: "3", sev: "amber", title: "Missing lead paint disclosure", code: "42 U.S.C. \u00A7 4852d" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className="bg-white rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full ${
                          s.sev === "red"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        } text-[10px] font-bold flex items-center justify-center`}
                      >
                        {s.num}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          s.sev === "red"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {s.sev === "red" ? "Prohibited" : "Missing"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-1.5">
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {s.code}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 right-8 bg-navy text-white rounded-xl px-4 py-2.5 shadow-lg text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300" /> Analyzed in under 2
              minutes
            </div>
          </div>
        </div>

        {/* ── PILLAR 2: TENANT RIGHTS (flipped) ── */}
        <div className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — visual */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 p-6 h-[360px] flex items-center justify-center">
              <MessageCircle className="w-16 h-16 text-emerald-200" />
            </div>
            {/* Overlapping chat mockup */}
            <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-900">
                  Rights Assistant
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  FREE
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 mb-2">
                My landlord hasn&rsquo;t fixed a leak for 2 weeks. What are my
                options?
              </div>
              <div className="bg-emerald-50 border-l-2 border-emerald-400 rounded-r-lg px-3 py-2 text-xs text-emerald-800">
                Under DC Code &sect; 42-3405, your landlord must address
                non-emergency repairs within 3-7 days&hellip;
              </div>
            </div>
          </div>
          {/* Right — text */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              TENANT RIGHTS RESOURCE
            </span>
            <h3
              className="text-2xl md:text-3xl font-bold text-slate-900 mt-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Know your rights. In plain English.
            </h3>
            <p className="text-base text-slate-500 leading-relaxed mt-3">
              Tenants shouldn&rsquo;t need a lawyer to understand their lease.
              Our AI answers questions about repairs, deposits, evictions, rent
              increases, and vouchers&nbsp;&mdash; grounded in the specific laws
              that apply in DC or Maryland.
            </p>
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Grounded in real housing codes",
                  desc: "Every answer cites the specific statute",
                },
                {
                  title: "Covers the questions that matter",
                  desc: "Repairs, deposits, eviction rights, lease terms, vouchers",
                },
                {
                  title: "Always free for tenants",
                  desc: "No account. No paywall. Legal guidance should be accessible.",
                },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {b.title}
                    </p>
                    <p className="text-sm text-slate-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* PRESERVED: /tenant-rights destination */}
            <Link
              href="/tenant-rights"
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mt-6"
            >
              Ask a Legal Question &mdash; Free{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── PILLAR 3: PROPERTY MANAGEMENT ── */}
        <div className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold">
              PROPERTY MANAGEMENT
            </span>
            <h3
              className="text-2xl md:text-3xl font-bold text-slate-900 mt-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Manage properties. Stay compliant. Avoid court.
            </h3>
            <p className="text-base text-slate-500 leading-relaxed mt-3">
              The full RentWise platform gives landlords and property managers a
              compliance-first dashboard&nbsp;&mdash; lease generation,
              maintenance tracking with legal repair timelines, Section 8 voucher
              workflows, and portfolio monitoring.
            </p>
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Compliant lease generation",
                  desc: "Pre-built with the right clauses for your jurisdiction",
                },
                {
                  title: "Maintenance with legal deadlines",
                  desc: "Built-in DC & MD repair timeline requirements",
                },
                {
                  title: "Portfolio compliance monitoring",
                  desc: "Every lease checked, every deadline tracked",
                },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {b.title}
                    </p>
                    <p className="text-sm text-slate-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* PRESERVED: /pricing destination (was "See Plans") */}
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 mt-6"
            >
              Explore the Platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Right — dashboard mockup */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-[10px] text-slate-400 text-center border border-slate-200">
                  rentwise.ai/dashboard
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Properties", val: "12" },
                    { label: "Compliant", val: "9" },
                    { label: "Action Needed", val: "3" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-lg border border-slate-200 p-3 text-center"
                    >
                      <p className="text-lg font-bold text-slate-900">
                        {s.val}
                      </p>
                      <p className="text-[10px] text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded bg-slate-100" />
                      <div className="flex-1">
                        <div className="h-2 w-32 bg-slate-100 rounded" />
                        <div className="h-1.5 w-20 bg-slate-50 rounded mt-1" />
                      </div>
                      <div
                        className={`h-5 w-16 rounded-full ${
                          i === 3
                            ? "bg-red-50 border border-red-200"
                            : "bg-emerald-50 border border-emerald-200"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS — Tabbed steps, no accordions
   ═══════════════════════════════════════════════════════════ */
type HowTab = "lease" | "rights" | "management";

const howTabs: { key: HowTab; label: string }[] = [
  { key: "lease", label: "Lease Review" },
  { key: "rights", label: "Tenant Rights" },
  { key: "management", label: "Property Management" },
];

function HowItWorks() {
  const [tab, setTab] = useState<HowTab>("lease");

  const leaseSteps = [
    {
      icon: Upload,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Upload your lease",
      desc: "Paste text or upload a PDF. Works with any DC or Maryland residential lease.",
      mini: (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-4 mt-4 text-center">
          <Upload className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-[10px] text-slate-400 mt-1">Drop lease file here</p>
        </div>
      ),
    },
    {
      icon: Zap,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      title: "AI flags every issue",
      desc: "Each clause is checked against housing codes. Prohibited terms, fees, missing disclosures \u2014 all flagged.",
      mini: (
        <div className="space-y-1.5 mt-4">
          <div className="bg-red-50 rounded-lg px-3 py-1.5 text-[10px] text-red-700 font-medium">Illegal waiver of liability</div>
          <div className="bg-red-50 rounded-lg px-3 py-1.5 text-[10px] text-red-700 font-medium">Excessive late fee ($150)</div>
          <div className="bg-amber-50 rounded-lg px-3 py-1.5 text-[10px] text-amber-700 font-medium">Missing lead paint disclosure</div>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      title: "Fix, export, comply",
      desc: "Accept AI fixes, export a compliance report, or generate a new compliant lease.",
      mini: (
        <div className="space-y-1.5 mt-4">
          <div className="bg-emerald-50 rounded-lg px-3 py-1.5 text-[10px] text-emerald-700 font-medium">Revised lease (clean)</div>
          <div className="bg-slate-50 rounded-lg px-3 py-1.5 text-[10px] text-slate-600 font-medium">Compliance report</div>
          <div className="bg-slate-50 rounded-lg px-3 py-1.5 text-[10px] text-slate-600 font-medium">Redlined changes</div>
        </div>
      ),
    },
  ];

  const rightsSteps = [
    {
      icon: MessageCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Ask your question",
      desc: "Type any question about repairs, deposits, eviction, or lease terms. No legal jargon needed.",
      mini: null,
    },
    {
      icon: Scale,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Get a clear answer",
      desc: "AI responds with plain-English explanations citing specific DC or Maryland statutes.",
      mini: null,
    },
    {
      icon: FileCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Know your next step",
      desc: "Get guidance on documenting issues, communicating with your landlord, and escalating.",
      mini: null,
    },
  ];

  const managementSteps = [
    {
      icon: Building2,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "Add your properties",
      desc: "Enter your property details and jurisdiction. Upload existing leases or generate new ones.",
      mini: null,
    },
    {
      icon: Search,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "Run compliance scans",
      desc: "AI reviews every lease and flags issues across your portfolio.",
      mini: null,
    },
    {
      icon: LayoutDashboard,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "Manage from one dashboard",
      desc: "Track maintenance deadlines, voucher processes, and compliance \u2014 all in one place.",
      mini: null,
    },
  ];

  const steps =
    tab === "lease"
      ? leaseSteps
      : tab === "rights"
      ? rightsSteps
      : managementSteps;

  return (
    <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider text-center">
          How It Works
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-center text-slate-900 mt-2"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          From upload to compliance report in three steps.
        </h2>

        {/* Tab switcher */}
        <div className="flex justify-center mt-10">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-full shadow-sm">
            {howTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-navy text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <span className="absolute top-4 right-4 text-7xl font-extrabold text-slate-100 select-none leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center relative`}
                >
                  <Icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed relative">
                  {s.desc}
                </p>
                {s.mini}
              </div>
            );
          })}
        </div>

        {/* PRESERVED: signup links from old accordion CTAs */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link
            href="/signup?type=landlord"
            className="text-sm font-semibold text-navy hover:text-navy-dark flex items-center gap-1"
          >
            Create Landlord Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/signup?type=property-manager"
            className="text-sm font-semibold text-navy hover:text-navy-dark flex items-center gap-1"
          >
            Property Manager Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/signup?type=tenant"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Free Tenant Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 8 / VOUCHER NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function VoucherSection() {
  const items = [
    "DCHA (DC) application walkthrough",
    "HAPGC (PG County) process guide",
    "HQS inspection prep checklist",
    "Required documentation tracker",
    "Rent reasonableness guidance",
    "Timeline & deadline reminders",
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Dark gradient background (solid — no external image dependency) */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#1a3352] to-[#0f172a]" />

      <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
            Voucher Navigation
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mt-3"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Section 8 tenants? We handle the complexity.
          </h2>
          <p className="text-blue-200 text-base mt-4 leading-relaxed">
            DCHA and HAPGC voucher programs are complex. RentWise walks
            landlords through every step&nbsp;&mdash; from application to HQS
            inspection&nbsp;&mdash; so you can fill units faster.
          </p>
          {/* PRESERVED: links to voucher wizard — routes through auth */}
          <Link
            href="/voucher-navigation"
            className="inline-flex items-center gap-2 mt-6 bg-white text-navy font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Start DCHA Application <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-white/90 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUILT RESPONSIBLY — Ethics section
   ═══════════════════════════════════════════════════════════ */
function EthicsSection() {
  const safeguards = [
    {
      icon: Scale,
      bg: "bg-blue-50",
      color: "text-blue-600",
      label: "Not legal advice",
      desc: "AI-powered guidance with clear disclaimers. Consult an attorney for specific situations.",
    },
    {
      icon: UserCheck,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
      label: "Human in the loop",
      desc: "AI suggestions require your approval. Nothing is auto-applied.",
    },
    {
      icon: Shield,
      bg: "bg-violet-50",
      color: "text-violet-600",
      label: "Privacy first",
      desc: "Documents are encrypted and never shared with third parties.",
    },
    {
      icon: AlertCircle,
      bg: "bg-amber-50",
      color: "text-amber-600",
      label: "Honest limitations",
      desc: "Every analysis includes what the AI can and can\u2019t verify.",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-y border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2
          className="text-2xl md:text-3xl font-bold text-slate-900"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built responsibly.
        </h2>
        <p className="text-slate-500 mt-2">
          AI is powerful but not perfect. Here&rsquo;s how we keep it honest.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
          {safeguards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <div
                  className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mx-auto`}
                >
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-3">
                  {s.label}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#0f172a]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          See what your lease is missing.
        </h2>
        <p className="text-slate-400 text-lg mt-4">
          Free lease review. No account required. Results in under two minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          {/* PRESERVED: /lease-review destination */}
          <Link
            href="/lease-review"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
          >
            Review Your Lease Free <ArrowRight className="w-4 h-4" />
          </Link>
          {/* PRESERVED: /pricing destination */}
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-400 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
          >
            See Pricing
          </Link>
        </div>
        {/* PRESERVED: signup links from old final CTA */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
          <Link
            href="/signup?type=landlord"
            className="text-slate-500 hover:text-white transition-colors"
          >
            Landlords: Start Free Trial &rarr;
          </Link>
          <Link
            href="/signup?type=tenant"
            className="text-slate-500 hover:text-white transition-colors"
          >
            Tenants: Access Free Tools &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Lease Review", href: "/lease-review" },
        { label: "Rights Assistant", href: "/tenant-rights" },
        { label: "Full Platform", href: "/pricing" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "DC Housing Laws", href: "/tenant-rights" },
        { label: "PG County Laws", href: "/tenant-rights" },
        { label: "Section 8 Guide", href: "/voucher-navigation" },
        { label: "Validation Results", href: "/testing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0a0f1a] py-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                {c.title}
              </p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              RentWise
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white text-sm">RentWise</span>
            </div>
            <p className="text-xs text-slate-500">
              AI-powered legal tools for DC &amp; Maryland landlords, property
              managers, and tenants.
            </p>
          </div>
        </div>

        {/* Legal disclaimer */}
        <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl mt-8 pt-6 border-t border-slate-800">
          RentWise provides AI-powered legal information for educational and
          informational purposes only. Our analysis does not constitute legal
          advice and does not create an attorney-client relationship. AI analysis
          is based on DC and Maryland housing codes as of February 2026. Laws
          change&nbsp;&mdash; always verify with current statutes and consult a
          licensed attorney for specific legal situations.
        </p>
        <p className="text-[11px] text-slate-700 mt-3">
          &copy; 2026 RentWise. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE — COMPOSED
   Section order:
   1. Navbar (sticky — from MainNav)
   2. Hero (two-column: text + screenshot)
   3. Section 8 Voucher (dark section — high visibility)
   4. Three Pillars (Lease Review → Tenant Rights → Property Management)
   5. How It Works (tabbed steps)
   6. Built Responsibly (ethics — 4 pillars)
   7. Final CTA (dark bg)
   8. Footer (with legal disclaimer)
   ═══════════════════════════════════════════════════════════ */
export function LandingPage() {
  return (
    <div className="min-h-screen">
      <MainNav />
      <main>
        <Hero />
        <VoucherSection />
        <ThreePillars />
        <HowItWorks />
        <EthicsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
