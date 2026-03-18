"use client";

import Link from "next/link";
import { useState } from "react";
import { MainNav } from "@/components/navigation/main-nav";
import {
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Home,
  Building2,
  Heart,
  ChevronDown,
  Shield,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   PRICING PAGE — Redesigned to match RentWise design language
   PRESERVED: All CTA links point to /sign-up
   ═══════════════════════════════════════════════════════════ */

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const proPrice = billing === "annual" ? "$12" : "$15";
  const pmPrice = billing === "annual" ? "$39" : "$49";
  const proPeriod = billing === "annual" ? "/mo, billed annually" : "/month";
  const pmPeriod = billing === "annual" ? "/mo + $2/unit, billed annually" : "/mo + $2/unit";

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNav />

      {/* ── PAGE HEADER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1e3a5f] to-[#162d4a] pt-20 pb-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            No hidden fees. No surprises.
          </span>

          <h1
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-blue-200 mt-4 max-w-xl mx-auto">
            Free for small landlords and tenants. Scales with your portfolio.
            Cancel anytime.
          </p>

          {/* Annual/Monthly toggle */}
          <div className="inline-flex items-center gap-1 bg-white/10 border border-white/15 p-1 rounded-full mt-8 backdrop-blur-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-white text-[#1e3a5f]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center ${
                billing === "annual"
                  ? "bg-white text-[#1e3a5f] font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="px-6 -mt-16 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* ===== FREE TIER ===== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/5 p-7 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Free</h3>
                <p className="text-xs text-slate-500">
                  For landlords with 1-2 units
                </p>
              </div>
            </div>

            <div className="mt-6 pb-6 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                  $0
                </span>
                <span className="text-base text-slate-400 font-medium">
                  /month
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                No credit card required
              </p>
            </div>

            {/* PRESERVED: /sign-up link */}
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Get Started Free
            </Link>

            <div className="mt-7 space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                Includes
              </p>
              {[
                {
                  title: "Up to 2 rental units",
                  desc: "Property profiles, tenant records, and unit tracking",
                },
                {
                  title: "AI Lease Review",
                  desc: "2 reviews/month \u00B7 Flags illegal clauses with DC & MD citations",
                },
                {
                  title: "Lease Template Generator",
                  desc: "2 leases/month \u00B7 Jurisdiction-compliant for DC & PG County",
                },
                {
                  title: "Tenant Rights Portal",
                  desc: "Full access \u00B7 AI legal Q&A for your tenants",
                },
                {
                  title: "Maintenance Tracking",
                  desc: "Tenant requests \u00B7 Legal repair timeline alerts (24hr/3-7 day)",
                },
                {
                  title: "Inspections",
                  desc: "Move-in/move-out photo documentation & checklists",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[13px] text-slate-800 font-semibold">
                      {f.title}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-slate-800 font-semibold">
                  Basic Notification Alerts
                </span>
              </div>
            </div>

            {/* Limitations */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                Limitations
              </p>
              {[
                "RentWise branding on exported documents",
                "No contractor recommendations",
                "No Section 8 voucher tools",
                "Email support only",
              ].map((l) => (
                <div key={l} className="flex items-center gap-2.5">
                  <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <span className="text-xs text-slate-400">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== LANDLORD PRO (HIGHLIGHTED) ===== */}
          <div className="relative bg-[#1e3a5f] rounded-2xl p-7 text-white shadow-xl shadow-[#1e3a5f]/25 ring-1 ring-white/10 md:scale-[1.02] md:-mt-4 md:mb-[-16px]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#1e3a5f] text-xs font-extrabold px-5 py-1.5 rounded-full shadow-lg shadow-amber-400/30 uppercase tracking-wider">
                Most Popular
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Landlord Pro</h3>
                <p className="text-xs text-blue-300">
                  For growing portfolios
                </p>
              </div>
            </div>

            <div className="mt-6 pb-6 border-b border-white/10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white tracking-tight">
                  {proPrice}
                </span>
                <span className="text-base text-blue-300 font-medium">
                  {proPeriod}
                </span>
              </div>
              <p className="text-sm text-blue-200 mt-2">
                Up to 10 units &middot; $3/unit beyond 10
              </p>
            </div>

            {/* PRESERVED: /sign-up link */}
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl bg-white text-[#1e3a5f] text-sm font-bold hover:bg-blue-50 transition-all shadow-lg shadow-white/10"
            >
              Start Pro Trial
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-7 space-y-4">
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-[0.1em]">
                Everything in Free, plus
              </p>
              {[
                {
                  title: "Unlimited Lease Reviews & Generation",
                  desc: "No monthly caps \u00B7 Review and generate as many as you need",
                },
                {
                  title: "Section 8 Voucher Navigator",
                  desc: "AI-guided DCHA & HAPGC applications \u00B7 RFTA wizard \u00B7 HQS inspection prep with 43-item checklist",
                },
                {
                  title: "Contractor Recommendations",
                  desc: "Licensed plumbers, electricians, HVAC techs \u00B7 Matched to your jurisdiction",
                },
                {
                  title: "AI Legal Assistant for Landlords",
                  desc: "Unlimited questions \u00B7 DC & MD housing code citations",
                },
                {
                  title: "Advanced Notifications",
                  desc: "License renewals \u00B7 Lease expirations \u00B7 Compliance deadlines \u00B7 Inspection reminders",
                },
                {
                  title: "Move-in/Move-out Comparison Reports",
                  desc: "Side-by-side condition photos \u00B7 Security deposit documentation",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[13px] text-white font-semibold">
                      {f.title}
                    </span>
                    <p className="text-xs text-blue-200 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-white font-semibold">
                  Priority Email Support
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-white font-semibold">
                  No RentWise Branding on Exports
                </span>
              </div>
            </div>

            {/* Value callout */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-blue-200 leading-relaxed">
                <span className="font-semibold text-white">
                  Most landlords save 2-3 hours per lease review
                </span>{" "}
                &mdash; at $300/hr attorney rates, that&rsquo;s $600-$900 per
                review. The Pro plan pays for itself with one review.
              </p>
            </div>
          </div>

          {/* ===== PROPERTY MANAGER ===== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/5 p-7 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Property Manager
                </h3>
                <p className="text-xs text-slate-500">
                  For PM companies at scale
                </p>
              </div>
            </div>

            <div className="mt-6 pb-6 border-b border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                  {pmPrice}
                </span>
                <span className="text-base text-slate-400 font-medium">
                  {pmPeriod}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Volume discounts at 100+ units
              </p>
            </div>

            {/* PRESERVED: /sign-up link */}
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Contact Sales
            </Link>

            <div className="mt-7 space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                Everything in Pro, plus
              </p>
              {[
                {
                  title: "Team Member Accounts",
                  desc: "Role-based access \u00B7 Assign properties to staff",
                },
                {
                  title: "Portfolio Compliance Dashboard",
                  desc: "All properties \u00B7 All jurisdictions \u00B7 License tracking \u00B7 Inspection status",
                },
                {
                  title: "Bulk Lease Review",
                  desc: "Review entire portfolio against current housing codes in one pass",
                },
                {
                  title: "API Access",
                  desc: "Integrate RentWise with your existing PMS",
                },
                {
                  title: "Custom Branding",
                  desc: "Your logo on tenant portal & exported documents",
                },
                {
                  title: "Owner Reporting",
                  desc: "Monthly financial statements \u00B7 Compliance audit trails",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[13px] text-slate-800 font-semibold">
                      {f.title}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-slate-800 font-semibold">
                  Dedicated Account Support
                </span>
              </div>
            </div>

            {/* Enterprise callout */}
            <div className="mt-6 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-xs text-violet-700 leading-relaxed">
                <span className="font-semibold">Managing 100+ units?</span>{" "}
                Contact us for custom volume pricing and white-glove onboarding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PUBLIC ACCESS — Always Free ── */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Public Access &mdash; Always Free
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-lg">
                  We believe legal guidance should be accessible to everyone.
                  These tools are free forever &mdash; no login, no paywall, no
                  catch.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  {[
                    "Tenant Rights Portal",
                    "One free lease review",
                    "Section 8 overview & HQS checklist preview",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-sm text-emerald-700 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-slate-900 text-center mb-8"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Compare plans in detail
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-[40%]">
                    Feature
                  </th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">
                    Free
                  </th>
                  <th className="text-center text-xs font-bold text-[#1e3a5f] uppercase tracking-wider px-4 py-4 bg-blue-50/50">
                    Pro
                  </th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-4">
                    PM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feature: "Units", free: "Up to 2", pro: "Up to 10+", pm: "Unlimited" },
                  { feature: "AI Lease Review", free: "2/month", pro: "Unlimited", pm: "Unlimited + Bulk" },
                  { feature: "Lease Generation", free: "2/month", pro: "Unlimited", pm: "Unlimited" },
                  { feature: "Tenant Rights Portal", free: "check", pro: "check", pm: "check" },
                  { feature: "Maintenance Tracking", free: "Basic", pro: "Full + Legal Timelines", pm: "Full + Legal Timelines" },
                  { feature: "Section 8 Voucher Tools", free: "x", pro: "check", pm: "check" },
                  { feature: "HQS Inspection Checklist", free: "Preview only", pro: "Full 43-item checklist", pm: "Full + Portfolio-wide" },
                  { feature: "Contractor Recs", free: "x", pro: "check", pm: "check" },
                  { feature: "Inspections", free: "Basic", pro: "Comparison Reports", pm: "Comparison Reports" },
                  { feature: "Team Accounts", free: "x", pro: "x", pm: "check" },
                  { feature: "API Access", free: "x", pro: "x", pm: "check" },
                  { feature: "Custom Branding", free: "x", pro: "x", pm: "check" },
                  { feature: "Support", free: "Email", pro: "Priority Email", pm: "Dedicated Account Manager" },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {row.feature}
                    </td>
                    {(["free", "pro", "pm"] as const).map((tier) => {
                      const val = row[tier];
                      const bgClass = tier === "pro" ? "bg-blue-50/30" : "";
                      const fontClass = tier === "pro" ? "font-semibold" : "";
                      return (
                        <td
                          key={tier}
                          className={`text-center px-4 py-3.5 text-slate-600 ${bgClass} ${fontClass}`}
                        >
                          {val === "check" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : val === "x" ? (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl font-bold text-slate-900 text-center mb-8"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Common questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "What jurisdictions does RentWise cover?",
                a: "Washington, D.C. and Prince George\u2019s County, Maryland. Our AI is trained on the specific housing codes, tenant protections, and landlord-tenant regulations for both jurisdictions including DC\u2019s rental licensing requirements and PG County\u2019s 2024 rent stabilization law.",
              },
              {
                q: "Is this legal advice?",
                a: "No. RentWise provides AI-powered legal information based on DC and Maryland housing codes. It does not constitute legal advice and does not create an attorney-client relationship. We always recommend consulting a licensed attorney for specific legal situations.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Upgrade, downgrade, or cancel at any time from your account settings. No cancellation fees, no long-term contracts. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "What\u2019s included in the Section 8 Voucher Navigator?",
                a: "An AI-guided wizard for the DCHA (DC) and HAPGC (PG County) voucher application process. Includes: RFTA form guidance with field-by-field AI tips, HAP contract details, an HQS inspection prep checklist with 43 items across 8 categories highlighting the 21 most common failure points, required document tracking, and timeline estimates for the full lease-up process.",
              },
              {
                q: "How is this different from TurboTenant or Avail?",
                a: "TurboTenant and Avail are general-purpose property management tools. RentWise is built specifically for DC and Maryland housing law compliance. Our AI lease reviewer flags illegal clauses with specific statutory citations, our voucher navigator handles DCHA and HAPGC-specific workflows, and our maintenance tracker includes legally mandated repair timelines. No other tool offers this level of jurisdiction-specific legal intelligence.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-xl border border-slate-200 group"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-900">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-16 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Start free. Upgrade when you&rsquo;re ready.
          </h2>
          <p className="text-slate-400 mt-3">
            No credit card required. Set up in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            {/* PRESERVED: /sign-up link */}
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1e3a5f] font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            {/* PRESERVED: /sign-up link */}
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER (minimal — matches landing page) ── */}
      <footer className="bg-[#0a0f1a] py-8">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-3xl">
            RentWise provides AI-powered legal information for educational and
            informational purposes only. Our analysis does not constitute legal
            advice and does not create an attorney-client relationship.
          </p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">RentWise</span>
            </div>
            <p className="text-[11px] text-slate-700">
              &copy; 2026 RentWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
