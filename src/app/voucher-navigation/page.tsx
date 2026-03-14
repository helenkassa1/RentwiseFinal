import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  LogIn,
  Shield,
  ShieldAlert,
  User,
  UserPlus,
  Zap,
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
    { icon: ClipboardList, label: "Overview", desc: "Learn the DCHA process, timeline, and what documents you need" },
    { icon: User, label: "Owner Info", desc: "Enter your legal name, address, entity type, and contact details" },
    { icon: Home, label: "Property & Unit", desc: "Property address, year built, bedrooms, lead status" },
    { icon: FileText, label: "RTA Form", desc: "Requested rent, utilities, lease dates, tenant and voucher info" },
    { icon: Shield, label: "HAP Contract", desc: "Payment details and required HUD owner certifications" },
    { icon: ShieldAlert, label: "HQS Inspection Prep", desc: `${HQS_CHECKLIST.length} categories, ${HIGH_RISK_COUNT} high-risk items to check` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
          <Zap className="w-3.5 h-3.5" />
          AI-Guided Application
        </span>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Section 8 Voucher Application Wizard
        </h1>

        <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          Walk through the DCHA Request for Tenancy Approval step by step.
          Every form field includes AI-powered guidance — FMR limits, common
          mistakes, DCHA-specific requirements, and an HQS inspection checklist.
        </p>

        {/* Auth-gated CTAs */}
        {isSignedIn ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/dashboard/vouchers"
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-[#1e3a5f]/15"
            >
              Open Voucher Wizard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm text-amber-800 font-medium">
                Sign in or create a landlord account to access the voucher application wizard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup?type=landlord"
                className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-[#1e3a5f]/15"
              >
                <UserPlus className="w-4 h-4" />
                Create Landlord Account
              </Link>
              <Link
                href="/sign-in?redirect_url=/dashboard/vouchers"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In &amp; Continue
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Already have an account? Sign in to go directly to the wizard.
            </p>
          </div>
        )}
      </section>

      {/* What the wizard covers */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-8">What the wizard covers</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{s.label}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HQS Preview */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">HQS Inspection Checklist Preview</h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            {HQS_CHECKLIST.reduce((n, c) => n + c.items.length, 0)} items across {HQS_CHECKLIST.length} categories.
            High-risk items are the most common failure points.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HQS_CHECKLIST.map((cat) => {
              const highCount = cat.items.filter((i) => i.failureRisk === "high").length;
              return (
                <div key={cat.category} className="bg-white rounded-xl border border-slate-200 p-4">
                  <h4 className="text-sm font-bold text-slate-900">{cat.category}</h4>
                  <p className="text-xs text-slate-500 mt-1">{cat.items.length} items</p>
                  {highCount > 0 && (
                    <p className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 inline-block mt-2">
                      {highCount} high-risk
                    </p>
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
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                See full checklist in the wizard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/sign-in?redirect_url=/dashboard/vouchers"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Sign in to access the full checklist <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How it works — for non-signed-in users */}
      {!isSignedIn && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">How to Get Started</h2>
          <div className="space-y-4">
            {[
              {
                num: "1",
                title: "Create your free landlord account",
                desc: "Sign up takes less than a minute. Choose \"Landlord\" or \"Property Manager\" as your account type.",
                href: "/signup?type=landlord",
                linkLabel: "Create Account",
              },
              {
                num: "2",
                title: "Open the Voucher Wizard from your dashboard",
                desc: "Navigate to Section 8 / Vouchers in your dashboard sidebar. The AI-guided wizard walks you through every field.",
              },
              {
                num: "3",
                title: "Fill out the RFTA with AI guidance",
                desc: "Each field includes tips on DCHA requirements, common mistakes, FMR limits, and lead paint rules. Your progress auto-saves.",
              },
              {
                num: "4",
                title: "Download your completed RFTA packet",
                desc: "Get a pre-filled PDF packet matching the official DCHA forms — ready to print, sign, and upload to the DCHA Owner Portal.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div className="pt-1 flex-1">
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                  {"href" in step && step.href && (
                    <Link href={step.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2">
                      {step.linkLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/signup?type=landlord"
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#1e3a5f]/15"
            >
              <UserPlus className="w-5 h-5" />
              Create Your Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          {["Free for all landlords", "No data stored on our servers", "AI guidance, not legal advice"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
