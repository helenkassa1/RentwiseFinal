"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Home,
  Info,
  Lightbulb,
  Save,
  Shield,
  ShieldAlert,
  User,
  Zap,
  AlertTriangle,
  Building2,
  X,
} from "lucide-react";
import { FIELD_TIPS, type FieldTip } from "@/lib/voucher/dcha-tips";
import { HQS_CHECKLIST, ALL_HQS_ITEMS, HIGH_RISK_COUNT } from "@/lib/voucher/hqs-checklist";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type WizardStep = "overview" | "owner-info" | "property-unit" | "rta-form" | "lease-addendum" | "hqs-prep" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: ClipboardList },
  { key: "owner-info", label: "Owner Info", icon: User },
  { key: "property-unit", label: "Property", icon: Home },
  { key: "rta-form", label: "RTA Form", icon: FileText },
  { key: "lease-addendum", label: "Addendum", icon: Shield },
  { key: "hqs-prep", label: "HQS Prep", icon: ShieldAlert },
  { key: "review", label: "Review", icon: Check },
];

type FormData = {
  ownerName: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerType: string;
  taxIdType: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  unitNumber: string;
  yearBuilt: string;
  numberOfBedrooms: string;
  numberOfBathrooms: string;
  squareFootage: string;
  propertyType: string;
  isLeadFree: boolean;
  leadInspectionDate: string;
  requestedRent: string;
  securityDeposit: string;
  utilitiesIncluded: string[];
  proposedLeaseStartDate: string;
  proposedLeaseEndDate: string;
  tenantName: string;
  tenantCurrentAddress: string;
  voucherNumber: string;
  numberOfOccupants: string;
  hapPayeeName: string;
  hapPayeeAddress: string;
  ownerCertifications: Record<string, boolean>;
  hqsChecklist: Record<string, boolean>;
};

const INITIAL_FORM: FormData = {
  ownerName: "", ownerAddress: "", ownerCity: "", ownerState: "DC", ownerZip: "", ownerPhone: "", ownerEmail: "",
  ownerType: "individual", taxIdType: "ssn",
  propertyAddress: "", propertyCity: "Washington", propertyState: "DC", propertyZip: "", unitNumber: "",
  yearBuilt: "", numberOfBedrooms: "", numberOfBathrooms: "", squareFootage: "", propertyType: "apartment",
  isLeadFree: false, leadInspectionDate: "",
  requestedRent: "", securityDeposit: "", utilitiesIncluded: [], proposedLeaseStartDate: "", proposedLeaseEndDate: "",
  tenantName: "", tenantCurrentAddress: "", voucherNumber: "", numberOfOccupants: "",
  hapPayeeName: "", hapPayeeAddress: "",
  ownerCertifications: {
    "noConflict": false, "notDebarred": false, "unitMeetsHQS": false,
    "willMaintain": false, "noSidePayments": false, "accurateInfo": false,
  },
  hqsChecklist: {},
};

const UTILITY_OPTIONS = ["Electric", "Gas", "Water/Sewer", "Trash", "Internet", "Heat (if separate)"];

// ═══════════════════════════════════════════════════════════
// Tip Panel Component
// ═══════════════════════════════════════════════════════════

function TipPanel({ tip, onClose }: { tip: FieldTip | null; onClose: () => void }) {
  if (!tip) return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100 p-6 text-center">
      <Lightbulb className="w-8 h-8 text-blue-300 mx-auto" />
      <p className="text-sm text-slate-500 mt-3">Click the <Info className="w-3.5 h-3.5 inline text-blue-500" /> icon next to any field for AI-powered guidance.</p>
      <p className="text-xs text-slate-400 mt-2">Tips include DCHA-specific requirements, common mistakes, and best practices.</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-200 p-5 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">AI Guidance</h4>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-2">{tip.title}</p>
      <p className="text-sm text-slate-600 leading-relaxed">{tip.tip}</p>
      {tip.commonMistake && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Common Mistake</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">{tip.commonMistake}</p>
        </div>
      )}
      {tip.dchaRequirement && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><Shield className="w-3 h-3" /> DCHA Requirement</p>
          <p className="text-xs text-blue-600 mt-1 leading-relaxed">{tip.dchaRequirement}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Field wrapper with tip button
// ═══════════════════════════════════════════════════════════

function Field({ label, tipKey, activeTip, setActiveTip, children, required }: {
  label: string; tipKey?: string; activeTip: string | null;
  setActiveTip: (k: string | null) => void; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {tipKey && FIELD_TIPS[tipKey] && (
          <button
            type="button"
            onClick={() => setActiveTip(activeTip === tipKey ? null : tipKey)}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${activeTip === tipKey ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}
          >
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors";
const selectCls = inputCls;

// ═══════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════

export default function VouchersPage() {
  const [step, setStep] = useState<WizardStep>("overview");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const d = localStorage.getItem("rentwise-voucher-draft");
      if (d) setForm(JSON.parse(d));
    } catch {}
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
  }, []);

  const stepIdx = STEPS.findIndex((s) => s.key === step);
  const canNext = stepIdx < STEPS.length - 1;
  const canBack = stepIdx > 0;
  const next = () => { if (canNext) { setStep(STEPS[stepIdx + 1].key); setActiveTip(null); window.scrollTo(0, 0); } };
  const back = () => { if (canBack) { setStep(STEPS[stepIdx - 1].key); setActiveTip(null); window.scrollTo(0, 0); } };
  const goTo = (s: WizardStep) => { setStep(s); setActiveTip(null); window.scrollTo(0, 0); };

  const saveDraft = () => { localStorage.setItem("rentwise-voucher-draft", JSON.stringify(form)); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const hqsCheckedCount = Object.values(form.hqsChecklist).filter(Boolean).length;
  const hqsTotalCount = ALL_HQS_ITEMS.length;

  // ─── Render steps ────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case "overview": return <OverviewStep />;
      case "owner-info": return <OwnerInfoStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "property-unit": return <PropertyStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "rta-form": return <RTAStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "lease-addendum": return <LeaseAddendumStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "hqs-prep": return <HQSStep form={form} updateField={updateField} />;
      case "review": return <ReviewStep form={form} hqsCheckedCount={hqsCheckedCount} hqsTotalCount={hqsTotalCount} saveDraft={saveDraft} saved={saved} />;
    }
  };

  const currentTip = activeTip ? FIELD_TIPS[activeTip] ?? null : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Section 8 / DCHA Voucher Application</h1>
          <p className="text-sm text-slate-500">AI-guided walkthrough for the Request for Tenancy Approval</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STEPS.map((s, i) => {
            const isActive = s.key === step;
            const isPast = i < stepIdx;
            return (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => goTo(s.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive ? "bg-blue-600 text-white shadow-sm" :
                    isPast ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" :
                    "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${isPast ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content: form + tip panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-4">
            <button onClick={back} disabled={!canBack} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${canBack ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-50 text-slate-300 cursor-not-allowed"}`}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              <button onClick={saveDraft} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Draft"}
              </button>
              {canNext ? (
                <button onClick={next} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                  <Download className="w-4 h-4" /> Download Summary
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tip panel — desktop sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TipPanel tip={currentTip} onClose={() => setActiveTip(null)} />
          </div>
        </div>
      </div>

      {/* Tip panel — mobile inline (shown below form when a tip is active) */}
      {currentTip && (
        <div className="lg:hidden mt-4">
          <TipPanel tip={currentTip} onClose={() => setActiveTip(null)} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step Components
// ═══════════════════════════════════════════════════════════

function OverviewStep() {
  const timeline = [
    { step: "Submit RTA", days: "Day 1", desc: "Complete this form and submit to DCHA" },
    { step: "Rent Review", days: "Days 3-10", desc: "DCHA reviews rent reasonableness" },
    { step: "HQS Inspection", days: "Days 10-20", desc: "Inspector visits the unit" },
    { step: "Approval", days: "Days 20-30", desc: "DCHA approves or requests corrections" },
    { step: "HAP Contract", days: "Days 25-35", desc: "Contract executed, payments begin" },
  ];

  const documents = [
    "Property deed or LLC documentation",
    "W-9 form (completed)",
    "Lead inspection report (if pre-1978 property)",
    "Proof of ownership or management authority",
    "Current property insurance documentation",
    "Tenant's voucher information packet",
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">DCHA Request for Tenancy Approval</h2>
          <p className="text-sm text-slate-500">AI-guided walkthrough for DC Housing Authority voucher applications</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>What is this?</strong> The Request for Tenancy Approval (RTA) is the form landlords submit to DCHA
          when a Section 8 voucher holder wants to rent your unit. This wizard walks you through every field
          with AI-powered guidance to avoid common mistakes that cause delays.
        </p>
      </div>

      {/* Timeline */}
      <h3 className="text-base font-bold text-slate-900 mb-4">Typical Timeline</h3>
      <div className="space-y-3 mb-8">
        {timeline.map((t, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</div>
              {i < timeline.length - 1 && <div className="w-px h-6 bg-blue-200 mt-1" />}
            </div>
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{t.step}</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t.days}</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Documents needed */}
      <h3 className="text-base font-bold text-slate-900 mb-3">Documents You&apos;ll Need</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {documents.map((d) => (
          <div key={d} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-slate-700">{d}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span><strong>Important:</strong> This wizard helps you prepare your RTA application. The completed summary should be submitted to DCHA along with the official RTA form. RentWise does not submit forms to DCHA on your behalf.</span>
        </p>
      </div>
    </div>
  );
}

function OwnerInfoStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Owner / Landlord Information</h2>
      <p className="text-sm text-slate-500 mb-6">This mirrors the owner section of the DCHA RTA form and W-9 requirements.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Legal Name" tipKey="ownerName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} placeholder="e.g., Jane Smith or Smith Properties LLC" />
        </Field>

        <Field label="Ownership Type" tipKey="ownerType" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.ownerType} onChange={(e) => updateField("ownerType", e.target.value)}>
            <option value="individual">Individual</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
        </Field>

        <Field label="Mailing Address" tipKey="ownerAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.ownerAddress} onChange={(e) => updateField("ownerAddress", e.target.value)} placeholder="Street address" />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field label="City" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.ownerCity} onChange={(e) => updateField("ownerCity", e.target.value)} />
          </Field>
          <Field label="State" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.ownerState} onChange={(e) => updateField("ownerState", e.target.value)} />
          </Field>
          <Field label="ZIP" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.ownerZip} onChange={(e) => updateField("ownerZip", e.target.value)} />
          </Field>
        </div>

        <Field label="Phone Number" tipKey="ownerPhone" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="tel" value={form.ownerPhone} onChange={(e) => updateField("ownerPhone", e.target.value)} placeholder="(202) 555-0123" />
        </Field>

        <Field label="Email Address" tipKey="ownerEmail" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="email" value={form.ownerEmail} onChange={(e) => updateField("ownerEmail", e.target.value)} placeholder="you@example.com" />
        </Field>

        <Field label="Tax ID Type" tipKey="taxIdType" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.taxIdType} onChange={(e) => updateField("taxIdType", e.target.value)}>
            <option value="ssn">SSN (Individual)</option>
            <option value="ein">EIN (Business Entity)</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500 flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <span>We do not collect or store your SSN or EIN. You&apos;ll enter that directly on the official DCHA W-9 form. This wizard only prepares the information you need.</span>
        </p>
      </div>
    </div>
  );
}

function PropertyStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const pre1978 = form.yearBuilt && parseInt(form.yearBuilt) < 1978;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Property & Unit Details</h2>
      <p className="text-sm text-slate-500 mb-6">Information about the rental unit for the RTA form.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Property Address" tipKey="propertyAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.propertyAddress} onChange={(e) => updateField("propertyAddress", e.target.value)} placeholder="123 Main St NW" />
        </Field>

        <Field label="Unit Number" tipKey="unitNumber" activeTip={activeTip} setActiveTip={setActiveTip}>
          <input className={inputCls} value={form.unitNumber} onChange={(e) => updateField("unitNumber", e.target.value)} placeholder="e.g., Apt 2B or leave blank for SFH" />
        </Field>

        <div className="grid grid-cols-3 gap-2">
          <Field label="City" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.propertyCity} onChange={(e) => updateField("propertyCity", e.target.value)} />
          </Field>
          <Field label="State" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.propertyState} onChange={(e) => updateField("propertyState", e.target.value)} />
          </Field>
          <Field label="ZIP" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.propertyZip} onChange={(e) => updateField("propertyZip", e.target.value)} />
          </Field>
        </div>

        <Field label="Property Type" tipKey="propertyType" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.propertyType} onChange={(e) => updateField("propertyType", e.target.value)}>
            <option value="single_family">Single Family Home</option>
            <option value="townhouse">Townhouse</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condominium</option>
          </select>
        </Field>

        <Field label="Year Built" tipKey="yearBuilt" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="number" value={form.yearBuilt} onChange={(e) => updateField("yearBuilt", e.target.value)} placeholder="e.g., 1985" />
        </Field>

        <Field label="Bedrooms" tipKey="numberOfBedrooms" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.numberOfBedrooms} onChange={(e) => updateField("numberOfBedrooms", e.target.value)}>
            <option value="">Select...</option>
            {["Studio", "1", "2", "3", "4", "5+"].map((n) => <option key={n} value={n}>{n === "Studio" ? "Studio" : `${n} BR`}</option>)}
          </select>
        </Field>

        <Field label="Bathrooms" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.numberOfBathrooms} onChange={(e) => updateField("numberOfBathrooms", e.target.value)}>
            <option value="">Select...</option>
            {["1", "1.5", "2", "2.5", "3", "3+"].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>

        <Field label="Square Footage" tipKey="squareFootage" activeTip={activeTip} setActiveTip={setActiveTip}>
          <input className={inputCls} type="number" value={form.squareFootage} onChange={(e) => updateField("squareFootage", e.target.value)} placeholder="e.g., 850" />
        </Field>
      </div>

      {pre1978 && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Pre-1978 Property:</strong> Federal law requires a lead-based paint disclosure. DCHA will not approve tenancy without a valid lead inspection certificate.</span>
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Lead-Free Certificate?" tipKey="isLeadFree" activeTip={activeTip} setActiveTip={setActiveTip}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isLeadFree} onChange={(e) => updateField("isLeadFree", e.target.checked)} className="rounded border-slate-300" />
                <span className="text-sm text-slate-700">Property is certified lead-free</span>
              </label>
            </Field>
            <Field label="Inspection Date" tipKey="leadInspectionDate" activeTip={activeTip} setActiveTip={setActiveTip}>
              <input className={inputCls} type="date" value={form.leadInspectionDate} onChange={(e) => updateField("leadInspectionDate", e.target.value)} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function RTAStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const toggleUtility = (u: string) => {
    const cur = form.utilitiesIncluded;
    updateField("utilitiesIncluded", cur.includes(u) ? cur.filter((x) => x !== u) : [...cur, u]);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Request for Tenancy Approval</h2>
      <p className="text-sm text-slate-500 mb-6">Core RTA form fields — rent, utilities, lease terms, and tenant information.</p>

      {/* Rent section */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-2">Rent & Fees</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Requested Monthly Rent" tipKey="requestedRent" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
            <input className={`${inputCls} pl-7`} type="number" value={form.requestedRent} onChange={(e) => updateField("requestedRent", e.target.value)} placeholder="2,000" />
          </div>
        </Field>
        <Field label="Security Deposit" tipKey="securityDeposit" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
            <input className={`${inputCls} pl-7`} type="number" value={form.securityDeposit} onChange={(e) => updateField("securityDeposit", e.target.value)} placeholder="2,000" />
          </div>
        </Field>
      </div>

      {/* Utilities */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-8">Utilities Included in Rent</h3>
      <Field label="" tipKey="utilitiesIncluded" activeTip={activeTip} setActiveTip={setActiveTip}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {UTILITY_OPTIONS.map((u) => (
            <label key={u} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${form.utilitiesIncluded.includes(u) ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}>
              <input type="checkbox" checked={form.utilitiesIncluded.includes(u)} onChange={() => toggleUtility(u)} className="rounded border-slate-300" />
              <span className="text-sm">{u}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Lease dates */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-8">Proposed Lease Term</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Start Date" tipKey="proposedLeaseStartDate" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="date" value={form.proposedLeaseStartDate} onChange={(e) => updateField("proposedLeaseStartDate", e.target.value)} />
        </Field>
        <Field label="End Date" tipKey="proposedLeaseEndDate" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="date" value={form.proposedLeaseEndDate} onChange={(e) => updateField("proposedLeaseEndDate", e.target.value)} />
        </Field>
      </div>

      {/* Tenant info */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-8">Tenant Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Tenant Name" tipKey="tenantName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} placeholder="As shown on voucher" />
        </Field>
        <Field label="Voucher Number" tipKey="voucherNumber" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.voucherNumber} onChange={(e) => updateField("voucherNumber", e.target.value)} placeholder="e.g., DC-12345" />
        </Field>
        <Field label="Number of Occupants" tipKey="numberOfOccupants" activeTip={activeTip} setActiveTip={setActiveTip}>
          <input className={inputCls} type="number" value={form.numberOfOccupants} onChange={(e) => updateField("numberOfOccupants", e.target.value)} placeholder="Including children" />
        </Field>
      </div>
    </div>
  );
}

function LeaseAddendumStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const certs = [
    { key: "noConflict", label: "Owner has no conflict of interest with the tenant (not a relative or business associate)" },
    { key: "notDebarred", label: "Owner is not debarred, suspended, or subject to limited denial of participation in federal programs" },
    { key: "unitMeetsHQS", label: "Unit meets Housing Quality Standards or will be brought into compliance before lease start" },
    { key: "willMaintain", label: "Owner agrees to maintain the unit in accordance with HQS throughout the tenancy" },
    { key: "noSidePayments", label: "Owner will not collect side payments from the tenant beyond the approved tenant rent portion" },
    { key: "accurateInfo", label: "All information provided in this application is true and accurate" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">HAP Contract & Lease Addendum</h2>
      <p className="text-sm text-slate-500 mb-6">Housing Assistance Payment details and required owner certifications.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <Field label="HAP Payee Name" tipKey="hapPayeeName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.hapPayeeName} onChange={(e) => updateField("hapPayeeName", e.target.value)} placeholder="Who receives HAP payments" />
        </Field>
        <Field label="HAP Payment Address" tipKey="hapPayeeAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.hapPayeeAddress} onChange={(e) => updateField("hapPayeeAddress", e.target.value)} placeholder="Where to send payments" />
        </Field>
      </div>

      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Owner Certifications</h3>
      <div className="space-y-3">
        {certs.map((c) => (
          <label key={c.key} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.ownerCertifications[c.key] ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <input
              type="checkbox"
              checked={form.ownerCertifications[c.key] || false}
              onChange={(e) => updateField("ownerCertifications", { ...form.ownerCertifications, [c.key]: e.target.checked })}
              className="rounded border-slate-300 mt-0.5"
            />
            <span className="text-sm text-slate-700 leading-relaxed">{c.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> These certifications are required by HUD for all Section 8 HAP contracts. By checking each box, you confirm your understanding of these requirements.
        </p>
      </div>
    </div>
  );
}

function HQSStep({ form, updateField }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const toggle = (id: string) => updateField("hqsChecklist", { ...form.hqsChecklist, [id]: !form.hqsChecklist[id] });
  const checkedCount = Object.values(form.hqsChecklist).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">HQS Inspection Prep</h2>
          <p className="text-sm text-slate-500">Walk through every item a DCHA inspector checks. Fix issues before the visit.</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-slate-900">{checkedCount}/{ALL_HQS_ITEMS.length}</div>
          <div className="text-xs text-slate-500">items checked</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${ALL_HQS_ITEMS.length > 0 ? (checkedCount / ALL_HQS_ITEMS.length) * 100 : 0}%` }} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>{HIGH_RISK_COUNT} high-risk items</strong> are marked with a red indicator — these are the most common reasons units fail HQS inspections.
        </p>
      </div>

      <div className="space-y-6">
        {HQS_CHECKLIST.map((cat) => (
          <div key={cat.category}>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              {cat.category}
            </h3>
            <div className="space-y-1.5">
              {cat.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all group ${
                    form.hqsChecklist[item.id]
                      ? "bg-emerald-50 border-emerald-200"
                      : item.failureRisk === "high"
                      ? "bg-white border-red-200 hover:border-red-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input type="checkbox" checked={form.hqsChecklist[item.id] || false} onChange={() => toggle(item.id)} className="rounded border-slate-300 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${form.hqsChecklist[item.id] ? "text-emerald-700 line-through" : "text-slate-800"}`}>{item.label}</span>
                      {item.failureRisk === "high" && !form.hqsChecklist[item.id] && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">HIGH RISK</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">{item.tip}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ form, hqsCheckedCount, hqsTotalCount, saveDraft, saved }: {
  form: FormData; hqsCheckedCount: number; hqsTotalCount: number; saveDraft: () => void; saved: boolean;
}) {
  const sections = [
    {
      title: "Owner Information", items: [
        ["Name", form.ownerName], ["Type", form.ownerType], ["Address", `${form.ownerAddress}, ${form.ownerCity}, ${form.ownerState} ${form.ownerZip}`],
        ["Phone", form.ownerPhone], ["Email", form.ownerEmail], ["Tax ID Type", form.taxIdType.toUpperCase()],
      ],
    },
    {
      title: "Property & Unit", items: [
        ["Address", `${form.propertyAddress}${form.unitNumber ? `, ${form.unitNumber}` : ""}, ${form.propertyCity}, ${form.propertyState} ${form.propertyZip}`],
        ["Type", form.propertyType], ["Year Built", form.yearBuilt], ["Bedrooms", form.numberOfBedrooms], ["Bathrooms", form.numberOfBathrooms],
        ["Sq Ft", form.squareFootage], ["Lead-Free", form.isLeadFree ? "Yes" : "No"],
      ],
    },
    {
      title: "RTA Details", items: [
        ["Requested Rent", form.requestedRent ? `$${form.requestedRent}` : "—"], ["Security Deposit", form.securityDeposit ? `$${form.securityDeposit}` : "—"],
        ["Utilities Included", form.utilitiesIncluded.length > 0 ? form.utilitiesIncluded.join(", ") : "None"],
        ["Lease Start", form.proposedLeaseStartDate || "—"], ["Lease End", form.proposedLeaseEndDate || "—"],
        ["Tenant", form.tenantName || "—"], ["Voucher #", form.voucherNumber || "—"], ["Occupants", form.numberOfOccupants || "—"],
      ],
    },
    {
      title: "HAP Contract", items: [
        ["Payee Name", form.hapPayeeName || "—"], ["Payment Address", form.hapPayeeAddress || "—"],
        ["Certifications", `${Object.values(form.ownerCertifications).filter(Boolean).length}/6 completed`],
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Review Your Application</h2>
      <p className="text-sm text-slate-500 mb-6">Review all information before downloading. Click any section header to go back and edit.</p>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {s.items.filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-900 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* HQS Summary */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">HQS Inspection Prep</h3>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${hqsTotalCount > 0 ? (hqsCheckedCount / hqsTotalCount) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{hqsCheckedCount}/{hqsTotalCount}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {hqsCheckedCount === hqsTotalCount ? "All items checked — your unit is ready for inspection!" : `${hqsTotalCount - hqsCheckedCount} items remaining. Complete these before scheduling your HQS inspection.`}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
          <Download className="w-4 h-4" /> Download Application Summary
        </button>
        <button onClick={saveDraft} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Draft"}
        </button>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Next steps:</strong> Download this summary and use it as a reference when completing the official DCHA Request for Tenancy Approval form.
          Submit the RTA along with your W-9, lead inspection report (if applicable), and proof of ownership to your DCHA caseworker.
        </p>
      </div>
    </div>
  );
}
