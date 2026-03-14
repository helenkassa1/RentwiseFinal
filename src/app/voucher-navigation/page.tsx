import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { HQS_CHECKLIST, HIGH_RISK_COUNT } from "@/lib/voucher/hqs-checklist";

export default async function VoucherNavigationPage() {
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    isSignedIn = false;
  }

  const steps = [
    { label: "Overview", desc: "Learn the DCHA process, timeline, and what documents you need", accent: true },
    { label: "Owner Info", desc: "Legal name, address, entity type, and contact details" },
    { label: "Property & Unit", desc: "Address, year built, bedrooms, lead status" },
    { label: "RTA Form", desc: "Requested rent, utilities, lease dates, tenant and voucher info" },
    { label: "HAP Contract", desc: "Payment details and required HUD owner certifications" },
    { label: "HQS Inspection Prep", desc: `${HQS_CHECKLIST.length} categories, ${HIGH_RISK_COUNT} high-risk items to check`, key: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ HERO HEADER ═══ */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d4a6f] text-white relative overflow-hidden">
        {/* Subtle background grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative max-w-4xl mx-auto px-6 py-12 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            AI-Guided Application
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Section 8 Voucher Application Wizard
          </h1>

          {/* Description */}
          <p className="text-blue-200 text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Walk through the DCHA Request for Tenancy Approval step by step.
            Every form field includes AI-powered guidance — FMR limits, common
            mistakes, DCHA-specific requirements, and an HQS inspection checklist.
          </p>

          {/* Auth-gated CTAs */}
          {isSignedIn ? (
            <div className="flex justify-center mt-8">
              <Link
                href="/dashboard/vouchers"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#1e3a5f] font-semibold px-7 py-3.5 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg"
              >
                Open Voucher Wizard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md mx-auto backdrop-blur-sm">
              <p className="text-sm text-blue-200 mb-4">Sign in or create an account to access the wizard</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup?type=landlord"
                  className="flex items-center justify-center gap-2 bg-white text-[#1e3a5f] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Landlord Account
                </Link>
                <Link
                  href="/sign-in?redirect_url=/dashboard/vouchers"
                  className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In &amp; Continue
                </Link>
              </div>
              <p className="text-xs text-blue-300/60 mt-3">Already have an account? Sign in to go directly to the wizard.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ WHAT THE WIZARD COVERS ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>What the wizard covers</h2>
            <p className="text-slate-500 text-sm mt-2">Six sections, each with AI guidance tailored to DCHA requirements</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`bg-white border rounded-xl p-5 hover:border-[#1e3a5f]/30 hover:shadow-md transition-all duration-200 group cursor-pointer ${
                  s.key ? "border-slate-200 border-l-[3px] border-l-amber-400 hover:border-amber-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-blue-50 text-blue-600" : s.key ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    {i + 1}
                  </span>
                  {i === 0 && <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Start</span>}
                  {s.key && <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">KEY</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HQS INSPECTION CHECKLIST PREVIEW ═══ */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" /> HQS INSPECTION PREP
            </div>
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>HQS Inspection Checklist Preview</h2>
            <p className="text-slate-500 text-sm mt-2">
              {HQS_CHECKLIST.reduce((n, c) => n + c.items.length, 0)} items across {HQS_CHECKLIST.length} categories.{" "}
              <span className="text-red-600 font-medium">High-risk items</span> are the most common failure points.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {HQS_CHECKLIST.map((cat) => {
              const highCount = cat.items.filter((i) => i.failureRisk === "high").length;
              const highPercent = cat.items.length > 0 ? Math.round((highCount / cat.items.length) * 100) : 0;
              return (
                <div key={cat.category} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">{cat.category}</h4>
                    <span className="text-xs text-slate-400">{cat.items.length} items</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${highPercent}%` }} />
                  </div>
                  {highCount > 0 && (
                    <span className="text-[10px] font-semibold text-red-500 mt-1.5 inline-block">{highCount} high-risk</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Auth-gated CTA */}
          <div className="text-center mt-8">
            {isSignedIn ? (
              <Link
                href="/dashboard/vouchers"
                className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-blue-700 font-semibold transition-colors"
              >
                See full checklist in the wizard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/sign-in?redirect_url=/dashboard/vouchers"
                className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in to access the full checklist <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══ HOW TO GET STARTED (non-signed-in only) ═══ */}
      {!isSignedIn && (
        <section className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center" style={{ fontFamily: "'Instrument Serif', serif" }}>How to Get Started</h2>

            <div className="mt-10 space-y-0">
              {/* Step 1 */}
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 z-10">1</div>
                  <div className="w-px h-full bg-slate-200 mt-1" />
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-bold text-slate-900">Create your free landlord account</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Sign up takes less than a minute. Choose &ldquo;Landlord&rdquo; or &ldquo;Property Manager&rdquo; as your account type.</p>
                  <Link href="/signup?type=landlord" className="inline-flex items-center gap-1.5 text-sm text-[#2563eb] font-semibold mt-2 hover:text-blue-700 transition-colors">
                    Create Account <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 z-10">2</div>
                  <div className="w-px h-full bg-slate-200 mt-1" />
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-bold text-slate-900">Open the Voucher Wizard from your dashboard</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Navigate to Section 8 / Vouchers in your dashboard sidebar. The AI-guided wizard walks you through every field.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white text-sm font-bold flex items-center justify-center flex-shrink-0 z-10">3</div>
                  <div className="w-px h-full bg-slate-200 mt-1" />
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-bold text-slate-900">Fill out the RFTA with AI guidance</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Each field includes tips on DCHA requirements, common mistakes, FMR limits, and lead paint rules. Your progress auto-saves.</p>
                </div>
              </div>

              {/* Step 4 — last step, no connector line */}
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="pb-2">
                  <h3 className="text-base font-bold text-slate-900">Download your completed RFTA packet</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Get a pre-filled PDF matching the official DCHA forms — ready to print, sign, and upload to the DCHA Owner Portal.</p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8">
              <Link
                href="/signup?type=landlord"
                className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-7 py-3.5 rounded-xl text-base shadow-lg shadow-[#1e3a5f]/15 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Create Your Free Account
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-xs text-slate-400">
              {["Free for all landlords", "No data stored on our servers", "AI guidance, not legal advice"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust signals for signed-in users */}
      {isSignedIn && (
        <section className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-400">
            {["Free for all landlords", "No data stored on our servers", "AI guidance, not legal advice"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
