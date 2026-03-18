"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Home,
  Info,
  Lightbulb,
  Save,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  Zap,
  AlertTriangle,
  Building2,
  X,
  MapPin,
} from "lucide-react";
import { FIELD_TIPS, type FieldTip } from "@/lib/voucher/dcha-tips";
import { HQS_CHECKLIST, ALL_HQS_ITEMS, HIGH_RISK_COUNT } from "@/lib/voucher/hqs-checklist";
import { generateRFTAPdf } from "@/lib/voucher/generate-rfta-pdf";

// ═══════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════

type Jurisdiction = "dc" | "pg";
type WizardStep = "overview" | "owner-info" | "property-unit" | "rta-form" | "lease-addendum" | "hqs-prep" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: ClipboardList },
  { key: "owner-info", label: "Owner Info", icon: User },
  { key: "property-unit", label: "Property", icon: Home },
  { key: "rta-form", label: "HUD-52517", icon: FileText },
  { key: "lease-addendum", label: "Addendum", icon: Shield },
  { key: "hqs-prep", label: "HQS Prep", icon: ShieldAlert },
  { key: "review", label: "Review", icon: Check },
];

// Official PDF form URLs
const FORM_URLS = {
  hud52517: "https://www.hud.gov/sites/dfiles/OCHCO/documents/52517ENG.pdf",
  dchaRfta: "https://www.dchousing.org/wordpress/wp-content/uploads/2023/09/rfta.pdf",
  dchaForms: "https://www.dchousing.org/wordpress/landlords/documents-and-forms/",
  dchaPortal: "https://dcha.hcvportal.org",
  hapgcSite: "https://www.princegeorgescountymd.gov/departments-offices/housing-authority",
  hapgcLandlordPacket: "https://www.princegeorgescountymd.gov/sites/default/files/media-document/dcv4767_new-landlord-packet-pdf.pdf",
};

type FormData = {
  // Jurisdiction
  jurisdiction: Jurisdiction;
  phaName: string;
  // HUD-52517 Section 1-8: Unit information
  unitAddress: string;
  unitNumber: string;
  unitCity: string;
  unitState: string;
  unitZip: string;
  requestedLeaseStart: string;
  numberOfBedrooms: string;
  yearConstructed: string;
  proposedRent: string;
  securityDeposit: string;
  dateAvailableForInspection: string;
  // HUD-52517 Section 9: Structure type
  structureType: string;
  // HUD-52517 Section 10: Subsidy
  isSubsidized: boolean;
  subsidyType: string;
  // HUD-52517 Section 11: Utilities
  utilities: Record<string, "owner" | "tenant">;
  applianceRefrigerator: "owner" | "tenant";
  applianceRange: "owner" | "tenant";
  heatingFuelType: string;
  cookingFuelType: string;
  waterHeatingFuelType: string;
  // HUD-52517 Section 12: Owner certifications
  comparableUnits: { address: string; dateRented: string; amount: string }[];
  noFamilyRelationship: boolean;
  leadPaintStatus: string;
  // DCHA Packet: Tenant info
  tenantName: string;
  tenantCurrentAddress: string;
  tenantPhone: string;
  tenantEmail: string;
  voucherNumber: string;
  // DCHA Packet: Owner/Agent info
  ownerName: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerType: string;
  ownerAgentNumber: string;
  isNewOwner: boolean;
  hasScreenedTenant: boolean;
  // DCHA: Features & Amenities
  numberOfBathrooms: string;
  squareFootage: string;
  isRentStabilized: boolean;
  // DCHA: Direct Deposit
  bankName: string;
  accountType: string;
  hapPayeeName: string;
  hapPayeeAddress: string;
  // Certifications
  ownerCertifications: Record<string, boolean>;
  // HQS
  hqsChecklist: Record<string, boolean>;
};

const INITIAL_FORM: FormData = {
  jurisdiction: "dc",
  phaName: "District of Columbia Housing Authority (DCHA)",
  unitAddress: "", unitNumber: "", unitCity: "Washington", unitState: "DC", unitZip: "",
  requestedLeaseStart: "", numberOfBedrooms: "", yearConstructed: "",
  proposedRent: "", securityDeposit: "", dateAvailableForInspection: "",
  structureType: "",
  isSubsidized: false, subsidyType: "",
  utilities: {
    heating: "owner", cooking: "owner", waterHeating: "owner",
    otherElectric: "owner", water: "owner", sewer: "owner",
    trash: "owner", airConditioning: "owner",
  },
  applianceRefrigerator: "owner", applianceRange: "owner",
  heatingFuelType: "natural_gas", cookingFuelType: "electric", waterHeatingFuelType: "electric",
  comparableUnits: [{ address: "", dateRented: "", amount: "" }, { address: "", dateRented: "", amount: "" }, { address: "", dateRented: "", amount: "" }],
  noFamilyRelationship: false,
  leadPaintStatus: "",
  tenantName: "", tenantCurrentAddress: "", tenantPhone: "", tenantEmail: "", voucherNumber: "",
  ownerName: "", ownerAddress: "", ownerCity: "", ownerState: "DC", ownerZip: "",
  ownerPhone: "", ownerEmail: "", ownerType: "individual", ownerAgentNumber: "",
  isNewOwner: true, hasScreenedTenant: false,
  numberOfBathrooms: "", squareFootage: "", isRentStabilized: false,
  bankName: "", accountType: "checking", hapPayeeName: "", hapPayeeAddress: "",
  ownerCertifications: {
    noConflict: false, notDebarred: false, unitMeetsHQS: false,
    willMaintain: false, noSidePayments: false, accurateInfo: false,
  },
  hqsChecklist: {},
};

const STRUCTURE_TYPES = [
  { value: "single_family", label: "Single Family Detached (one family under one roof)" },
  { value: "semi_detached", label: "Semi-Detached (duplex, attached on one side)" },
  { value: "rowhouse", label: "Rowhouse/Townhouse (attached on two sides)" },
  { value: "low_rise", label: "Low-rise apartment building (4 stories or fewer)" },
  { value: "high_rise", label: "High-rise apartment building (5+ stories)" },
  { value: "manufactured", label: "Manufactured Home (mobile home)" },
];

const FUEL_TYPES = [
  { value: "natural_gas", label: "Natural Gas" },
  { value: "bottled_gas", label: "Bottled Gas" },
  { value: "electric", label: "Electric" },
  { value: "oil", label: "Oil" },
  { value: "heat_pump", label: "Heat Pump" },
  { value: "other", label: "Other" },
];

// ═══════════════════════════════════════════════════════════
// Tip Panel
// ═══════════════════════════════════════════════════════════

function TipPanel({ tip, onClose, jurisdiction }: { tip: FieldTip | null; onClose: () => void; jurisdiction: Jurisdiction }) {
  const agencyName = jurisdiction === "dc" ? "DCHA" : "HAPGC";
  if (!tip) return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span className="text-sm font-semibold text-white">AI Guidance</span>
        </div>
      </div>
      <div className="px-4 py-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-600 mt-3">Field-by-field guidance</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[200px] mx-auto">
          Click the <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[9px] font-bold mx-0.5">i</span> icon next to any field to get {agencyName}-specific requirements and common mistakes.
        </p>
      </div>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-semibold text-white">AI Guidance</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider">Guidance</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-2">{tip.title}</p>
        <p className="text-sm text-slate-700 leading-relaxed">{tip.tip}</p>
        {tip.commonMistake && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">Common Mistake</p>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">{tip.commonMistake}</p>
              </div>
            </div>
          </div>
        )}
        {tip.dchaRequirement && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">{agencyName} Requirement</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{tip.dchaRequirement}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Field wrapper
// ═══════════════════════════════════════════════════════════

function Field({ label, tipKey, activeTip, setActiveTip, children, required, hudField }: {
  label: string; tipKey?: string; activeTip: string | null;
  setActiveTip: (k: string | null) => void; children: React.ReactNode; required?: boolean; hudField?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {hudField && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{hudField}</span>}
        {tipKey && FIELD_TIPS[tipKey] && (
          <button type="button" onClick={() => setActiveTip(activeTip === tipKey ? null : tipKey)}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${activeTip === tipKey ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}>
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

  useEffect(() => {
    try { const d = localStorage.getItem("rentwise-voucher-draft"); if (d) setForm(JSON.parse(d)); } catch {}
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
  }, []);

  const setJurisdiction = (j: Jurisdiction) => {
    setForm((p) => ({
      ...p,
      jurisdiction: j,
      phaName: j === "dc" ? "District of Columbia Housing Authority (DCHA)" : "Housing Authority of Prince George's County (HAPGC)",
      unitCity: j === "dc" ? "Washington" : "",
      unitState: j === "dc" ? "DC" : "MD",
      ownerState: j === "dc" ? "DC" : "MD",
    }));
  };

  const stepIdx = STEPS.findIndex((s) => s.key === step);
  const canNext = stepIdx < STEPS.length - 1;
  const canBack = stepIdx > 0;
  const next = () => { if (canNext) { setStep(STEPS[stepIdx + 1].key); setActiveTip(null); window.scrollTo(0, 0); } };
  const back = () => { if (canBack) { setStep(STEPS[stepIdx - 1].key); setActiveTip(null); window.scrollTo(0, 0); } };
  const goTo = (s: WizardStep) => { setStep(s); setActiveTip(null); window.scrollTo(0, 0); };
  const saveDraft = () => { localStorage.setItem("rentwise-voucher-draft", JSON.stringify(form)); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const hqsCheckedCount = Object.values(form.hqsChecklist).filter(Boolean).length;
  const hqsTotalCount = ALL_HQS_ITEMS.length;
  const currentTip = activeTip ? FIELD_TIPS[activeTip] ?? null : null;
  const isDC = form.jurisdiction === "dc";
  const agencyName = isDC ? "DCHA" : "HAPGC";

  const renderStep = () => {
    switch (step) {
      case "overview": return <OverviewStep jurisdiction={form.jurisdiction} setJurisdiction={setJurisdiction} />;
      case "owner-info": return <OwnerInfoStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "property-unit": return <PropertyStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "rta-form": return <RTAStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "lease-addendum": return <LeaseAddendumStep form={form} updateField={updateField} activeTip={activeTip} setActiveTip={setActiveTip} />;
      case "hqs-prep": return <HQSStep form={form} updateField={updateField} />;
      case "review": return <ReviewStep form={form} hqsCheckedCount={hqsCheckedCount} hqsTotalCount={hqsTotalCount} saveDraft={saveDraft} saved={saved} />;
    }
  };

  const progressPercent = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Section 8 Voucher Application</h1>
              <p className="text-xs text-slate-500 mt-0.5">HUD Form 52517 &mdash; Request for Tenancy Approval ({agencyName})</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">{isDC ? "DC / DCHA" : "PG County / HAPGC"}</span>
          </div>
        </div>
      </div>

      {/* ═══ STEP PROGRESS BAR ═══ */}
      <div className="border-b border-slate-200 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center overflow-x-auto py-3 gap-1 scrollbar-none">
            {STEPS.map((s, i) => {
              const isActive = s.key === step;
              const isPast = i < stepIdx;
              return (
                <div key={s.key} className="flex items-center flex-shrink-0">
                  <button onClick={() => goTo(s.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      isActive
                        ? "bg-[#1e3a5f] text-white font-semibold"
                        : isPast
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-slate-500 hover:bg-slate-50"
                    }`}>
                    {isPast ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </span>
                    ) : isActive ? (
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{i + 1}</span>
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mx-0.5" />}
                </div>
              );
            })}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 -mx-6">
          <div className="h-full bg-[#1e3a5f] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* ═══ TWO-COLUMN CONTENT ═══ */}
      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main content — 2 of 3 columns */}
        <div className="lg:col-span-2 min-h-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">{renderStep()}</div>
        </div>

        {/* AI Guidance panel — 1 of 3 columns */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <TipPanel tip={currentTip} onClose={() => setActiveTip(null)} jurisdiction={form.jurisdiction} />
          {/* Progress summary below guidance */}
          <div className="mt-4 bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Application Progress</span>
              <span className="text-xs text-slate-400">Step {stepIdx + 1} of {STEPS.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-[#1e3a5f] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <button onClick={saveDraft} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors">
                <Save className="w-3.5 h-3.5" />
                {saved ? "Saved!" : "Save Draft"}
              </button>
              <span className="text-[10px] text-slate-400">Auto-saves as you go</span>
            </div>
          </div>
        </div>
      </div>
      {currentTip && <div className="lg:hidden px-6 mb-4"><TipPanel tip={currentTip} onClose={() => setActiveTip(null)} jurisdiction={form.jurisdiction} /></div>}

      {/* ═══ BOTTOM NAVIGATION BAR ═══ */}
      <div className="border-t border-slate-200 bg-white px-6 py-4 sticky bottom-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={back} disabled={!canBack}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${canBack ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={saveDraft} className="flex items-center gap-2 text-sm text-slate-600 font-medium px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Draft"}
            </button>
            {canNext ? (
              <button onClick={next} className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => { try { const doc = generateRFTAPdf(form); doc.save(`RFTA-Packet-${form.ownerName?.replace(/\s+/g, "-") || "draft"}-${new Date().toISOString().slice(0, 10)}.pdf`); } catch(e) { console.error(e); } }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                <Download className="w-4 h-4" /> Download RFTA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 1: Overview — with jurisdiction selector + real PDF links
// ═══════════════════════════════════════════════════════════

function OverviewStep({ jurisdiction, setJurisdiction }: { jurisdiction: Jurisdiction; setJurisdiction: (j: Jurisdiction) => void }) {
  const isDC = jurisdiction === "dc";

  const dcTimeline = [
    { step: "Get a DC Basic Business License", days: "Before you begin", desc: "DC requires all landlords to hold a valid BBL with a 'Housing: Rental' endorsement before leasing a unit" },
    { step: "Create DCHA Owner Portal Account", days: "Day 1", desc: "Register at dcha.hcvportal.org — click \"Sign Up\" under \"New to the HCVP Program?\"" },
    { step: "Fill Out & Submit RFTA Packet", days: "Day 1–2", desc: "Complete the HUD-52517 + DCHA supplemental forms and upload to the Owner Portal" },
    { step: "DCHA Reviews Eligibility", days: "~5 business days", desc: "DCHA verifies ownership, rent reasonableness, and tenant affordability" },
    { step: "Prepare Unit for Inspection", days: "While waiting", desc: "Use the HQS Prep checklist in Step 6 — complete every item so your unit passes on the first try" },
    { step: "HQS Inspection", days: "~12 business days", desc: "DCHA inspector evaluates unit per Housing Quality Standards. Unit must be vacant, clean, all utilities on" },
    { step: "HAP Contract Executed", days: "~15 business days", desc: "DCHA sends HAP contract and first payment once unit passes inspection" },
  ];

  const pgTimeline = [
    { step: "Obtain a PG County Rental License", days: "Before you begin", desc: "PG County requires a rental license from DPIE before leasing — apply through the county permit office" },
    { step: "Register with HAPGC", days: "Day 1", desc: "Contact HAPGC at (301) 883-5501 or visit their office to register as a new landlord" },
    { step: "Fill Out & Submit RTA + Landlord Packet", days: "Day 1–2", desc: "Complete HUD-52517 + HAPGC forms, submit with Direct Deposit form, W-9, and voided check" },
    { step: "Rent Reasonableness Review", days: "~7 business days", desc: "HAPGC reviews proposed rent against comparable units in the area" },
    { step: "Prepare Unit for Inspection", days: "While waiting", desc: "Go through the HQS checklist — fix any issues now so your unit doesn't fail inspection" },
    { step: "HQS Inspection", days: "~14 business days", desc: "Unit inspected for Housing Quality Standards compliance" },
    { step: "Approval & HAP Contract", days: "~21 business days", desc: "Contract executed, HAP payments begin" },
  ];

  const timeline = isDC ? dcTimeline : pgTimeline;

  const dcDocs = [
    "Valid DC Basic Business License (BBL) with Rental endorsement",
    "HUD Form 52517 — Request for Tenancy Approval",
    "DCHA Property Owner/Agent Information Form",
    "DCHA Direct Deposit Authorization Form",
    "DCHA Features and Amenities Form",
    "W-9 (Tax ID verification)",
    "Copy of property deed or LLC documentation",
    "Lead inspection report (if built before 1978)",
    "DCHA HQS Move-In Inspection Checklist",
  ];

  const pgDocs = [
    "PG County Rental License (DPIE)",
    "HUD Form 52517 — Request for Tenancy Approval",
    "HAPGC New Landlord Packet",
    "Direct Deposit Authorization + voided check",
    "W-9 (Tax ID verification)",
    "Copy of property deed",
    "Lead inspection report (if built before 1978)",
  ];

  const documents = isDC ? dcDocs : pgDocs;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f]/5 flex items-center justify-center"><ClipboardList className="w-6 h-6 text-[#1e3a5f]" /></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Request for Tenancy Approval (HUD-52517)</h2>
          <p className="text-sm text-slate-500">AI-guided walkthrough for Section 8 voucher applications</p>
        </div>
      </div>

      {/* Jurisdiction selector */}
      <div className="mt-4 mb-6">
        <label className="text-sm font-semibold text-slate-700 mb-2 block">Select your jurisdiction</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setJurisdiction("dc")}
            className={`relative rounded-xl p-4 text-left border-2 transition-all ${isDC ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            {isDC && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>}
            <p className={`text-sm font-bold ${isDC ? "text-white" : "text-slate-700"}`}>Washington, DC</p>
            <p className={`text-xs mt-0.5 ${isDC ? "text-blue-200" : "text-slate-400"}`}>DCHA &mdash; DC Housing Authority</p>
          </button>
          <button onClick={() => setJurisdiction("pg")}
            className={`relative rounded-xl p-4 text-left border-2 transition-all ${!isDC ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            {!isDC && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>}
            <p className={`text-sm font-bold ${!isDC ? "text-white" : "text-slate-700"}`}>Prince George&apos;s County, MD</p>
            <p className={`text-xs mt-0.5 ${!isDC ? "text-blue-200" : "text-slate-400"}`}>HAPGC &mdash; Housing Authority of PG County</p>
          </button>
        </div>
      </div>

      {/* Getting Started — Before You Fill Out the Form */}
      <div className="mt-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900">Before You Start: Get These Ready</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isDC ? (
          <>
            <a href="https://mybusiness.dc.gov" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-amber-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900">Get a DC Basic Business License (BBL)</h4>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">DC law requires all landlords to hold a BBL with a &ldquo;Housing: Rental&rdquo; endorsement before leasing. Apply online — processing takes ~10 business days.</p>
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold mt-2 group-hover:text-amber-700">mybusiness.dc.gov <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://dcha.hcvportal.org" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-slate-900">Create a DCHA Owner Portal Account</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">New owners must register first. Click &ldquo;Sign Up&rdquo; under &ldquo;New to the HCVP Program?&rdquo;</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 group-hover:text-blue-700">dcha.hcvportal.org <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="text-sm font-bold text-slate-900">Download &amp; Complete Your W-9</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">IRS Form W-9 must match your Owner/Agent form name and Tax ID exactly.</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 group-hover:text-blue-700">Download from IRS.gov <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://doee.dc.gov/publication/lead-based-paint-consultant-companies" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-red-200 p-4 hover:border-red-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">4</span>
                <h4 className="text-sm font-bold text-slate-900">Lead Inspection (Pre-1978 Properties)</h4>
              </div>
              <p className="text-xs text-red-600 leading-relaxed">Required by federal law (24 CFR 35). DCHA will NOT approve without it. Contact DC DOEE for certified inspectors.</p>
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold mt-2 group-hover:text-red-700">DC DOEE Lead Paint Services <ExternalLink className="w-3 h-3" /></span>
            </a>
          </>
        ) : (
          <>
            <a href="https://www.princegeorgescountymd.gov/departments-offices/permitting-inspections-enforcement" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-amber-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900">Get a PG County Rental License</h4>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">PG County requires a rental license from DPIE (Dept. of Permitting, Inspections &amp; Enforcement) before you can legally lease a unit.</p>
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold mt-2 group-hover:text-amber-700">PG County DPIE <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://www.princegeorgescountymd.gov/departments-offices/housing-authority" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-slate-900">Register with HAPGC</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Contact HAPGC at (301) 883-5501 to register as a new landlord and get your landlord packet.</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 group-hover:text-blue-700">HAPGC Website <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">3</span>
                <h4 className="text-sm font-bold text-slate-900">Download &amp; Complete Your W-9</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Required for HAP payment processing. Must match your owner name and Tax ID.</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2 group-hover:text-blue-700">Download from IRS.gov <ExternalLink className="w-3 h-3" /></span>
            </a>
            <a href="https://mde.maryland.gov/programs/land/LeadPoisoningPrevention/Pages/index.aspx" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-red-200 p-4 hover:border-red-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">4</span>
                <h4 className="text-sm font-bold text-slate-900">Lead Inspection (Pre-1978 Properties)</h4>
              </div>
              <p className="text-xs text-red-600 leading-relaxed">MD Environment Code 6-8 requires lead-free certification. Contact MDE for approved inspectors.</p>
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold mt-2 group-hover:text-red-700">MD Lead Poisoning Prevention <ExternalLink className="w-3 h-3" /></span>
            </a>
          </>
        )}
      </div>
      </div>

      {/* Download official forms */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Official {isDC ? "DCHA" : "HAPGC"} Forms</h3>
        </div>
        <div className="space-y-2">
          <a href={FORM_URLS.hud52517} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>HUD-52517 Request for Tenancy Approval (PDF)</span>
            <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
          </a>
          {isDC ? (
            <>
              <a href={FORM_URLS.dchaRfta} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>DCHA Complete RFTA Packet (PDF &mdash; includes all forms)</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
              </a>
              <a href={FORM_URLS.dchaForms} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>DCHA Documents &amp; Forms Page</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
              </a>
              <a href={FORM_URLS.dchaPortal} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span>DCHA Owner Portal (submit RFTA online)</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
              </a>
            </>
          ) : (
            <>
              <a href={FORM_URLS.hapgcLandlordPacket} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>HAPGC New Landlord Packet (PDF)</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
              </a>
              <a href={FORM_URLS.hapgcSite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 -mx-3 transition-colors">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span>HAPGC Housing Authority Website</span>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* What is this? callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">What is this?</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              This wizard walks you through every field of the official HUD-52517 Request for Tenancy Approval
              {isDC ? " and the DCHA RFTA supplemental packet" : " and the HAPGC landlord packet"}.
              AI guidance helps you avoid common mistakes that cause delays. When you&apos;re done, download your filled summary to reference when completing the official forms.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">{isDC ? "DCHA" : "HAPGC"} Lease-Up Timeline</h3>
        <div className="space-y-0">
          {timeline.map((t, i) => {
            const isLast = i === timeline.length - 1;
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {isLast ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 z-10">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 z-10">{i + 1}</div>
                  )}
                  {!isLast && <div className="w-px h-full bg-slate-200 mt-1" />}
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{t.step}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.days === "Day 1" ? "bg-slate-100 text-slate-500" :
                      isLast ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                      "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>{t.days}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required documents */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Required Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {documents.map((d) => (
            <div key={d} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center flex-shrink-0" />
              <span className="text-xs text-slate-700">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Important</h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              {isDC ? "DCHA requires submission via the Owner Portal at dcha.hcvportal.org. The family should NOT move in until the unit passes inspection, rent is approved, and the HAP contract is executed." : "HAPGC requires submission with a completed Direct Deposit form and voided check. Do not allow move-in before HAP contract execution."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-800">Ready?</h4>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              Click &ldquo;Next&rdquo; to begin filling out your application. When you finish, you&apos;ll be able to download a completed RFTA packet PDF with all your information pre-filled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 2: Owner/Agent Info — mirrors DCHA Property Owner/Agent Form
// ═══════════════════════════════════════════════════════════

function OwnerInfoStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const isDC = form.jurisdiction === "dc";
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{isDC ? "DCHA Property Owner/Agent Information" : "HAPGC Owner Information"}</h2>
      <p className="text-sm text-slate-500 mb-6">{isDC ? "This mirrors the DCHA Property Owner/Agent Information Form included in the RFTA packet." : "Owner information required by HAPGC for the landlord packet."}</p>

      {isDC && (
        <div className="flex items-center gap-4 mb-6">
          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${form.isNewOwner ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200"}`}>
            <input type="radio" checked={form.isNewOwner} onChange={() => updateField("isNewOwner", true)} className="text-blue-600" />
            <span className="text-sm">New Owner</span>
          </label>
          <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${!form.isNewOwner ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200"}`}>
            <input type="radio" checked={!form.isNewOwner} onChange={() => updateField("isNewOwner", false)} className="text-blue-600" />
            <span className="text-sm">Existing Owner/Agent</span>
          </label>
          {!form.isNewOwner && (
            <Field label="Owner/Agent #" activeTip={activeTip} setActiveTip={setActiveTip}>
              <input className={inputCls} value={form.ownerAgentNumber} onChange={(e) => updateField("ownerAgentNumber", e.target.value)} placeholder="DCHA ID" />
            </Field>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Owner Full Legal Name" tipKey="ownerName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} placeholder="As shown on deed" />
        </Field>
        <Field label="Entity Type" tipKey="ownerType" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.ownerType} onChange={(e) => updateField("ownerType", e.target.value)}>
            <option value="individual">Individual</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
        </Field>
        <Field label="Mailing Address" tipKey="ownerAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.ownerAddress} onChange={(e) => updateField("ownerAddress", e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="City" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.ownerCity} onChange={(e) => updateField("ownerCity", e.target.value)} /></Field>
          <Field label="State" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.ownerState} onChange={(e) => updateField("ownerState", e.target.value)} /></Field>
          <Field label="ZIP" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.ownerZip} onChange={(e) => updateField("ownerZip", e.target.value)} /></Field>
        </div>
        <Field label="Phone" tipKey="ownerPhone" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="tel" value={form.ownerPhone} onChange={(e) => updateField("ownerPhone", e.target.value)} placeholder="(202) 555-0123" />
        </Field>
        <Field label="Email" tipKey="ownerEmail" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="email" value={form.ownerEmail} onChange={(e) => updateField("ownerEmail", e.target.value)} />
        </Field>
      </div>

      {isDC && (
        <div className="mt-5">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.hasScreenedTenant} onChange={(e) => updateField("hasScreenedTenant", e.target.checked)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">I have screened my potential tenant for this unit</span>
          </label>
          <p className="text-xs text-slate-400 ml-6 mt-1">Note: Screening tenants is the owner&apos;s sole responsibility. DCHA/HUD does not screen for suitability.</p>
        </div>
      )}

      <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500 flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <span>We do not collect or store your SSN, EIN, or bank details. Enter those directly on the official {isDC ? "DCHA" : "HAPGC"} forms and W-9.</span>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 3: Property & Unit — HUD-52517 Fields 1-10
// ═══════════════════════════════════════════════════════════

function PropertyStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const isDC = form.jurisdiction === "dc";
  const pre1978 = form.yearConstructed && parseInt(form.yearConstructed) < 1978;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">HUD-52517: Unit Information</h2>
      <p className="text-sm text-slate-500 mb-6">Fields 1-10 of the official HUD Request for Tenancy Approval form.</p>

      {/* Field 1: PHA Name */}
      <Field label="1. Name of Public Housing Agency (PHA)" hudField="HUD §1" activeTip={activeTip} setActiveTip={setActiveTip}>
        <input className={`${inputCls} bg-slate-50`} value={form.phaName} readOnly />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
        {/* Field 2: Address */}
        <Field label="2. Address of Unit" hudField="HUD §2" tipKey="propertyAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.unitAddress} onChange={(e) => updateField("unitAddress", e.target.value)} placeholder="Street address" />
        </Field>
        <div className="grid grid-cols-4 gap-2">
          <Field label="Unit #" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.unitNumber} onChange={(e) => updateField("unitNumber", e.target.value)} /></Field>
          <Field label="City" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.unitCity} onChange={(e) => updateField("unitCity", e.target.value)} /></Field>
          <Field label="State" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.unitState} onChange={(e) => updateField("unitState", e.target.value)} /></Field>
          <Field label="ZIP" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={form.unitZip} onChange={(e) => updateField("unitZip", e.target.value)} /></Field>
        </div>

        {/* Fields 3-8 */}
        <Field label="3. Requested Lease Start Date" hudField="HUD §3" tipKey="proposedLeaseStartDate" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="date" value={form.requestedLeaseStart} onChange={(e) => updateField("requestedLeaseStart", e.target.value)} />
        </Field>
        <Field label="4. Number of Bedrooms" hudField="HUD §4" tipKey="numberOfBedrooms" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <select className={selectCls} value={form.numberOfBedrooms} onChange={(e) => updateField("numberOfBedrooms", e.target.value)}>
            <option value="">Select...</option>
            {["0 (Studio)", "1", "2", "3", "4", "5+"].map((n) => <option key={n} value={n}>{n} BR</option>)}
          </select>
        </Field>
        <Field label="5. Year Constructed" hudField="HUD §5" tipKey="yearBuilt" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="number" value={form.yearConstructed} onChange={(e) => updateField("yearConstructed", e.target.value)} placeholder="e.g., 1985" />
        </Field>
        <Field label="6. Proposed Rent" hudField="HUD §6" tipKey="pricingStrategy" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
            <input className={`${inputCls} pl-7`} type="number" value={form.proposedRent} onChange={(e) => updateField("proposedRent", e.target.value)} />
          </div>
        </Field>
        <Field label="7. Security Deposit" hudField="HUD §7" tipKey="securityDeposit" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
            <input className={`${inputCls} pl-7`} type="number" value={form.securityDeposit} onChange={(e) => updateField("securityDeposit", e.target.value)} />
          </div>
        </Field>
        <Field label="8. Date Unit Available for Inspection" hudField="HUD §8" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} type="date" value={form.dateAvailableForInspection} onChange={(e) => updateField("dateAvailableForInspection", e.target.value)} />
        </Field>
      </div>

      {/* Field 9: Structure Type */}
      <div className="mt-5">
        <Field label="9. Structure Type" hudField="HUD §9" tipKey="propertyType" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {STRUCTURE_TYPES.map((st) => (
              <label key={st.value} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${form.structureType === st.value ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                <input type="radio" name="structureType" checked={form.structureType === st.value} onChange={() => updateField("structureType", st.value)} className="text-blue-600" />
                {st.label}
              </label>
            ))}
          </div>
        </Field>
      </div>

      {/* DCHA Features & Amenities form extras */}
      {isDC && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Number of Bathrooms" hudField="DCHA F&A" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} value={form.numberOfBathrooms} onChange={(e) => updateField("numberOfBathrooms", e.target.value)} />
          </Field>
          <Field label="Square Footage" hudField="DCHA F&A" tipKey="squareFootage" activeTip={activeTip} setActiveTip={setActiveTip}>
            <input className={inputCls} type="number" value={form.squareFootage} onChange={(e) => updateField("squareFootage", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={form.isRentStabilized} onChange={(e) => updateField("isRentStabilized", e.target.checked)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-700">This unit is rent stabilized or under rent control (DCHD registration required)</span>
          </label>
        </div>
      )}

      {pre1978 && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Pre-1978 Property:</strong> Federal lead-based paint disclosure is required (24 CFR 35). {isDC ? "DCHA" : "HAPGC"} will not approve tenancy without valid documentation.</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 4: HUD-52517 RTA — Fields 11-12 + Tenant info
// ═══════════════════════════════════════════════════════════

function RTAStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const isDC = form.jurisdiction === "dc";

  const utilityRows = [
    { key: "heating", label: "Heating" },
    { key: "cooking", label: "Cooking" },
    { key: "waterHeating", label: "Water Heating" },
    { key: "otherElectric", label: "Other Electric" },
    { key: "water", label: "Water" },
    { key: "sewer", label: "Sewer" },
    { key: "trash", label: "Trash Collection" },
    { key: "airConditioning", label: "Air Conditioning" },
  ];

  const updateUtility = (key: string, val: "owner" | "tenant") => {
    updateField("utilities", { ...form.utilities, [key]: val });
  };

  const updateComparable = (idx: number, field: string, val: string) => {
    const updated = [...form.comparableUnits];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField("comparableUnits", updated);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">HUD-52517: Utilities, Certifications &amp; Tenant</h2>
      <p className="text-sm text-slate-500 mb-6">Fields 11-15 of the official form, plus {isDC ? "DCHA" : "HAPGC"} tenant information.</p>

      {/* Section 11: Utilities */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">HUD §11</span>
        Utilities and Appliances
      </h3>
      <p className="text-xs text-slate-500 mb-3">Mark &ldquo;O&rdquo; for owner-paid or &ldquo;T&rdquo; for tenant-paid. Per HUD: unless otherwise specified, the owner pays for all utilities.</p>

      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Utility</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-center w-24">Owner (O)</th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-center w-24">Tenant (T)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {utilityRows.map((u) => (
              <tr key={u.key} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-700">{u.label}</td>
                <td className="text-center"><input type="radio" name={`util-${u.key}`} checked={form.utilities[u.key] === "owner"} onChange={() => updateUtility(u.key, "owner")} className="text-blue-600" /></td>
                <td className="text-center"><input type="radio" name={`util-${u.key}`} checked={form.utilities[u.key] === "tenant"} onChange={() => updateUtility(u.key, "tenant")} className="text-blue-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Field label="Heating Fuel Type" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.heatingFuelType} onChange={(e) => updateField("heatingFuelType", e.target.value)}>
            {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>
        <Field label="Cooking Fuel Type" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.cookingFuelType} onChange={(e) => updateField("cookingFuelType", e.target.value)}>
            {FUEL_TYPES.filter((f) => f.value !== "heat_pump").map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>
        <Field label="Water Heating Fuel" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.waterHeatingFuelType} onChange={(e) => updateField("waterHeatingFuelType", e.target.value)}>
            {FUEL_TYPES.filter((f) => f.value !== "heat_pump").map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <Field label="Refrigerator provided by" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.applianceRefrigerator} onChange={(e) => updateField("applianceRefrigerator", e.target.value as "owner" | "tenant")}>
            <option value="owner">Owner</option><option value="tenant">Tenant</option>
          </select>
        </Field>
        <Field label="Range/Microwave provided by" activeTip={activeTip} setActiveTip={setActiveTip}>
          <select className={selectCls} value={form.applianceRange} onChange={(e) => updateField("applianceRange", e.target.value as "owner" | "tenant")}>
            <option value="owner">Owner</option><option value="tenant">Tenant</option>
          </select>
        </Field>
      </div>

      {/* Section 12a: Comparable units */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">HUD §12a</span>
        Comparable Unassisted Units (if 4+ units in project)
      </h3>
      <p className="text-xs text-slate-500 mb-3">Required for owners with more than 4 units at the same address. List your most recently leased comparable unassisted units.</p>
      <div className="space-y-2 mb-8">
        {form.comparableUnits.map((cu, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-1 text-xs text-slate-400 font-bold pt-7">{i + 1}.</div>
            <div className="col-span-5"><Field label="Address & unit #" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} value={cu.address} onChange={(e) => updateComparable(i, "address", e.target.value)} /></Field></div>
            <div className="col-span-3"><Field label="Date Rented" activeTip={activeTip} setActiveTip={setActiveTip}><input className={inputCls} type="date" value={cu.dateRented} onChange={(e) => updateComparable(i, "dateRented", e.target.value)} /></Field></div>
            <div className="col-span-3"><Field label="Rent Amount" activeTip={activeTip} setActiveTip={setActiveTip}><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span><input className={`${inputCls} pl-7`} value={cu.amount} onChange={(e) => updateComparable(i, "amount", e.target.value)} /></div></Field></div>
          </div>
        ))}
      </div>

      {/* Section 12c: Lead paint */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">HUD §12c</span>
        Lead-Based Paint Status
      </h3>
      <Field label="" tipKey="leadAssessment" activeTip={activeTip} setActiveTip={setActiveTip}>
        <div className="space-y-2">
          {[
            { value: "post1978", label: "Lead-based paint requirements do not apply (built on or after January 1, 1978)" },
            { value: "certified_free", label: "Unit has been found to be lead-based paint free by a certified inspector" },
            { value: "disclosure_attached", label: "A completed lead-based paint disclosure statement is attached" },
          ].map((opt) => (
            <label key={opt.value} className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${form.leadPaintStatus === opt.value ? "bg-blue-50 border-blue-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="leadPaint" checked={form.leadPaintStatus === opt.value} onChange={() => updateField("leadPaintStatus", opt.value)} className="text-blue-600 mt-0.5" />
              <span className="text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Tenant info */}
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-8 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{isDC ? "DCHA" : "HAPGC"}</span>
        Tenant Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Tenant Name" tipKey="tenantName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} placeholder="As shown on voucher" />
        </Field>
        <Field label="Voucher Number" tipKey="voucherNumber" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.voucherNumber} onChange={(e) => updateField("voucherNumber", e.target.value)} placeholder={isDC ? "DC-XXXXX" : "MD-XXXXX"} />
        </Field>
        <Field label="Tenant Current Address" activeTip={activeTip} setActiveTip={setActiveTip}>
          <input className={inputCls} value={form.tenantCurrentAddress} onChange={(e) => updateField("tenantCurrentAddress", e.target.value)} />
        </Field>
        <Field label="Tenant Phone" activeTip={activeTip} setActiveTip={setActiveTip}>
          <input className={inputCls} type="tel" value={form.tenantPhone} onChange={(e) => updateField("tenantPhone", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 5: HAP Contract & Certifications
// ═══════════════════════════════════════════════════════════

function LeaseAddendumStep({ form, updateField, activeTip, setActiveTip }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  activeTip: string | null; setActiveTip: (k: string | null) => void;
}) {
  const isDC = form.jurisdiction === "dc";
  const certs = [
    { key: "noConflict", label: "Owner (including a principal or other interested party) is not the parent, child, grandparent, grandchild, sister, or brother of any member of the family (HUD §12b)" },
    { key: "unitMeetsHQS", label: "Unit meets Housing Quality Standards or will be brought into compliance before lease start" },
    { key: "willMaintain", label: "Owner agrees to maintain the unit in accordance with HQS throughout the tenancy" },
    { key: "noSidePayments", label: "Owner will not collect side payments from the tenant beyond the approved tenant rent portion" },
    { key: "accurateInfo", label: "All information provided is true and correct under penalty of perjury (18 U.S.C. §§ 287, 1001, 1010, 1012)" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">HAP Contract &amp; Direct Deposit</h2>
      <p className="text-sm text-slate-500 mb-6">Housing Assistance Payment details{isDC ? " and DCHA Direct Deposit Authorization" : ""}.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <Field label="HAP Payee Name" tipKey="hapPayeeName" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.hapPayeeName} onChange={(e) => updateField("hapPayeeName", e.target.value)} placeholder="Who receives HAP payments" />
        </Field>
        <Field label="HAP Payee Address" tipKey="hapPayeeAddress" activeTip={activeTip} setActiveTip={setActiveTip} required>
          <input className={inputCls} value={form.hapPayeeAddress} onChange={(e) => updateField("hapPayeeAddress", e.target.value)} />
        </Field>
      </div>

      {isDC && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">DCHA Direct Deposit Authorization</p>
          <p className="text-xs text-blue-700 mb-3">DCHA strongly recommends direct deposit for faster HAP payments. Complete this information and submit with a voided check or bank letter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Financial Institution" activeTip={activeTip} setActiveTip={setActiveTip}>
              <input className={inputCls} value={form.bankName} onChange={(e) => updateField("bankName", e.target.value)} placeholder="Bank name" />
            </Field>
            <Field label="Account Type" activeTip={activeTip} setActiveTip={setActiveTip}>
              <select className={selectCls} value={form.accountType} onChange={(e) => updateField("accountType", e.target.value)}>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </Field>
          </div>
          <p className="text-[10px] text-blue-600 mt-3 flex items-center gap-1"><Shield className="w-3 h-3" /> Routing and account numbers are entered on the official DCHA form only — not stored here.</p>
        </div>
      )}

      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Owner Certifications (HUD §12-15)</h3>
      <div className="space-y-3">
        {certs.map((c) => (
          <label key={c.key} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.ownerCertifications[c.key] ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <input type="checkbox" checked={form.ownerCertifications[c.key] || false}
              onChange={(e) => updateField("ownerCertifications", { ...form.ownerCertifications, [c.key]: e.target.checked })} className="rounded border-slate-300 mt-0.5" />
            <span className="text-sm text-slate-700 leading-relaxed">{c.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 6: HQS Prep — from real DCHA checklist
// ═══════════════════════════════════════════════════════════

function HQSStep({ form, updateField }: {
  form: FormData; updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const isDC = form.jurisdiction === "dc";
  const toggle = (id: string) => updateField("hqsChecklist", { ...form.hqsChecklist, [id]: !form.hqsChecklist[id] });
  const checkedCount = Object.values(form.hqsChecklist).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{isDC ? "DCHA" : "HAPGC"} HQS Move-In Inspection Checklist</h2>
          <p className="text-sm text-slate-500">{isDC ? "Based on the official DCHA HCVP HQS Move-In Inspection Checklist for Landlords." : "Based on HUD Housing Quality Standards inspection requirements."}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-slate-900">{checkedCount}/{ALL_HQS_ITEMS.length}</div>
          <div className="text-xs text-slate-500">items checked</div>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${ALL_HQS_ITEMS.length > 0 ? (checkedCount / ALL_HQS_ITEMS.length) * 100 : 0}%` }} />
      </div>

      {isDC && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
          <strong>From DCHA:</strong> Each unit to be rented in the HCVP MUST pass HQS inspection. The unit must be empty/vacant, free of debris,
          freshly painted, with all utilities turned on. All construction must be completed before inspection.
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700"><strong>{HIGH_RISK_COUNT} high-risk items</strong> are the most common reasons units fail inspection.</p>
      </div>

      <div className="space-y-6">
        {HQS_CHECKLIST.map((cat) => (
          <div key={cat.category}>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />{cat.category}
            </h3>
            <div className="space-y-1.5">
              {cat.items.map((item) => (
                <label key={item.id}
                  className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all group ${form.hqsChecklist[item.id] ? "bg-emerald-50 border-emerald-200" : item.failureRisk === "high" ? "bg-white border-red-200 hover:border-red-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                  <input type="checkbox" checked={form.hqsChecklist[item.id] || false} onChange={() => toggle(item.id)} className="rounded border-slate-300 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${form.hqsChecklist[item.id] ? "text-emerald-700 line-through" : "text-slate-800"}`}>{item.label}</span>
                      {item.failureRisk === "high" && !form.hqsChecklist[item.id] && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">HIGH RISK</span>}
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

// ═══════════════════════════════════════════════════════════
// Step 7: Review & Export
// ═══════════════════════════════════════════════════════════

function ReviewStep({ form, hqsCheckedCount, hqsTotalCount, saveDraft, saved }: {
  form: FormData; hqsCheckedCount: number; hqsTotalCount: number; saveDraft: () => void; saved: boolean;
}) {
  const isDC = form.jurisdiction === "dc";
  const agencyName = isDC ? "DCHA" : "HAPGC";

  const utilsPaid = Object.entries(form.utilities).filter(([, v]) => v === "tenant").map(([k]) => k).join(", ") || "None (owner pays all)";

  const downloadRFTA = () => {
    try {
      const doc = generateRFTAPdf(form);
      doc.save(`RFTA-Packet-${form.ownerName?.replace(/\s+/g, "-") || "draft"}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  const pre1978 = form.yearConstructed && parseInt(form.yearConstructed) < 1978;

  const sections = [
    {
      title: `${agencyName} Owner Information`, items: [
        ["Name", form.ownerName], ["Type", form.ownerType], ["Address", `${form.ownerAddress}, ${form.ownerCity}, ${form.ownerState} ${form.ownerZip}`],
        ["Phone", form.ownerPhone], ["Email", form.ownerEmail],
      ],
    },
    {
      title: "HUD-52517: Unit Information", items: [
        ["PHA", form.phaName],
        ["Unit Address", `${form.unitAddress}${form.unitNumber ? ` #${form.unitNumber}` : ""}, ${form.unitCity}, ${form.unitState} ${form.unitZip}`],
        ["Lease Start", form.requestedLeaseStart], ["Bedrooms", form.numberOfBedrooms],
        ["Year Constructed", form.yearConstructed], ["Proposed Rent", form.proposedRent ? `$${form.proposedRent}` : "—"],
        ["Security Deposit", form.securityDeposit ? `$${form.securityDeposit}` : "—"],
        ["Structure Type", STRUCTURE_TYPES.find((s) => s.value === form.structureType)?.label ?? "—"],
        ["Lead Paint Status", form.leadPaintStatus || "—"],
      ],
    },
    {
      title: "Utilities (Tenant-Paid)", items: [["Tenant pays", utilsPaid]],
    },
    {
      title: "Tenant Information", items: [
        ["Name", form.tenantName], ["Voucher #", form.voucherNumber],
        ["Current Address", form.tenantCurrentAddress], ["Phone", form.tenantPhone],
      ],
    },
    {
      title: "HAP Contract", items: [
        ["Payee", form.hapPayeeName], ["Address", form.hapPayeeAddress],
        ["Certifications", `${Object.values(form.ownerCertifications).filter(Boolean).length}/5 completed`],
      ],
    },
  ];

  // ── Submission coaching steps ─────────────────────────
  let dcStepNum = 0;
  const dcSubmissionSteps = [
    {
      num: ++dcStepNum, title: "Confirm You Have a DC Basic Business License (BBL)",
      desc: "DC requires all landlords to hold a valid BBL with a \"Housing: Rental\" endorsement. If you don't have one yet, apply online — it takes ~10 business days to process.",
      link: "https://mybusiness.dc.gov",
      linkLabel: "Apply at mybusiness.dc.gov",
    },
    {
      num: ++dcStepNum, title: "Create a DCHA Owner Portal Account",
      desc: "New owners must register at the HCVP Owner Portal. Click \"Sign Up\" under \"New to the HCVP Program? Signup Now\".",
      link: "https://dcha.hcvportal.org",
      linkLabel: "Open DCHA Owner Portal",
    },
    {
      num: ++dcStepNum, title: "Get Your W-9 Ready",
      desc: "Download IRS Form W-9 and complete it with your legal name and Tax ID (SSN or EIN). This must match the Owner/Agent form exactly.",
      link: "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
      linkLabel: "Download W-9 from IRS.gov",
    },
    ...(pre1978 ? [{
      num: ++dcStepNum, title: "Obtain a Lead Inspection Report",
      desc: "Pre-1978 properties require a lead-free certificate from a DC-licensed inspector (DC Code 8-231.01). DCHA will NOT approve tenancy without it. Contact DOEE for approved inspectors.",
      link: "https://doee.dc.gov/publication/lead-based-paint-consultant-companies",
      linkLabel: "DC DOEE Lead Paint Services",
    },
    {
      num: ++dcStepNum, title: "Complete HUD Lead Visual Assessment Training",
      desc: "HUD offers a free online visual lead assessment training course for owners. Complete and print the certificate to include in your packet.",
      link: "https://apps.hud.gov/offices/lead/training/visualassessment/h00101.htm",
      linkLabel: "HUD Lead Assessment Training (Free)",
    }] : []),
    {
      num: ++dcStepNum, title: "Gather Supporting Documents",
      desc: "Collect: BBL copy, property deed (or LLC documentation / Articles of Incorporation), photo ID matching your signature, EIN assignment letter (for LLCs), and a voided check or bank letter for direct deposit.",
    },
    {
      num: ++dcStepNum, title: "Download Your Completed RFTA Packet",
      desc: "Click the button below to download a pre-filled RFTA packet PDF with all your information. Print it, sign where indicated, and attach your supporting documents.",
      action: "download",
    },
    {
      num: ++dcStepNum, title: "Upload to the DCHA Owner Portal",
      desc: "Log into your Owner Portal account and upload the complete packet. You can track the lease-up status through the portal as it moves through eligibility review, inspection, and HAP contract processing.",
      link: "https://dcha.hcvportal.org",
      linkLabel: "Go to Owner Portal",
    },
    {
      num: ++dcStepNum, title: "Prepare Unit for HQS Inspection (While Waiting)",
      desc: "While DCHA reviews your packet, use this time to prepare the unit. Go through the HQS checklist in Step 6 and fix every item — unit must be vacant, freshly painted, with all utilities on and all construction complete. Passing on the first try saves weeks.",
    },
    {
      num: ++dcStepNum, title: "Pass the HQS Inspection",
      desc: "DCHA will schedule an inspector. If the unit passes, DCHA processes the HAP contract and your first payment. If it fails, you'll get a list of deficiencies — fix them and request a re-inspection.",
    },
  ];

  let pgStepNum = 0;
  const pgSubmissionSteps = [
    {
      num: ++pgStepNum, title: "Get a PG County Rental License",
      desc: "PG County requires a rental license from DPIE (Dept. of Permitting, Inspections & Enforcement) before you can legally lease a unit. Apply through the county permit office.",
      link: "https://www.princegeorgescountymd.gov/departments-offices/permitting-inspections-enforcement",
      linkLabel: "PG County DPIE",
    },
    {
      num: ++pgStepNum, title: "Register with HAPGC",
      desc: "Call (301) 883-5501 or visit the HAPGC office to register as a new landlord. You can also download the New Landlord Packet from their website.",
      link: "https://www.princegeorgescountymd.gov/departments-offices/housing-authority",
      linkLabel: "HAPGC Housing Authority Website",
    },
    {
      num: ++pgStepNum, title: "Get Your W-9 Ready",
      desc: "Download IRS Form W-9 and complete it with your legal name and Tax ID.",
      link: "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
      linkLabel: "Download W-9 from IRS.gov",
    },
    ...(pre1978 ? [{
      num: ++pgStepNum, title: "Obtain a Lead Inspection Report",
      desc: "Pre-1978 properties require a lead-free certificate from a certified inspector. Maryland requires compliance with MD Code, Environment 6-8. Contact MDE for approved inspectors.",
      link: "https://mde.maryland.gov/programs/land/LeadPoisoningPrevention/Pages/index.aspx",
      linkLabel: "MD Lead Poisoning Prevention",
    }] : []),
    {
      num: ++pgStepNum, title: "Gather Supporting Documents",
      desc: "Collect: rental license copy, property deed, photo ID, voided check for direct deposit, and completed Direct Deposit Authorization form.",
    },
    {
      num: ++pgStepNum, title: "Download Your Completed RFTA Packet",
      desc: "Click the button below to download a pre-filled packet PDF. Print, sign, and attach supporting documents.",
      action: "download",
    },
    {
      num: ++pgStepNum, title: "Submit to HAPGC",
      desc: "Submit complete packet to: Housing Authority of PG County, 9200 Basil Court, Suite 107, Largo, MD 20774. Or call (301) 883-5501 for submission instructions.",
    },
    {
      num: ++pgStepNum, title: "Prepare Unit for HQS Inspection (While Waiting)",
      desc: "While HAPGC reviews your packet, go through the HQS checklist in Step 6. Fix every item now so your unit passes on the first try — failed inspections add weeks to the process.",
    },
    {
      num: ++pgStepNum, title: "Pass the HQS Inspection",
      desc: "HAPGC will schedule an inspector. If the unit passes, they process the HAP contract and payments begin. If it fails, fix deficiencies and request re-inspection.",
    },
  ];

  const submissionSteps = isDC ? dcSubmissionSteps : pgSubmissionSteps;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Review &amp; Submit — {agencyName} RFTA Packet</h2>
      <p className="text-sm text-slate-500 mb-6">Review your information, then follow the step-by-step guide to submit your application.</p>

      {/* ── Download RFTA Button (prominent) ────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-center">
        <FileText className="w-8 h-8 text-blue-200 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-white mb-1">Your RFTA Packet is Ready</h3>
        <p className="text-sm text-blue-100 mb-4 max-w-md mx-auto">Download a pre-filled PDF with all the information you&apos;ve entered. Print it, sign it, and submit with your supporting documents.</p>
        <button onClick={downloadRFTA} className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg">
          <Download className="w-5 h-5" /> Download Completed RFTA Packet (PDF)
        </button>
        <p className="text-[11px] text-blue-200 mt-3">Generates {isDC ? "7" : "5"}-page packet: Cover Sheet + HUD-52517 + {isDC ? "Features & Amenities + Owner/Agent Form + Direct Deposit + " : ""}HQS Checklist</p>
      </div>

      {/* ── Step-by-step submission guide ─────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" /> Step-by-Step Submission Guide
        </h3>
        <p className="text-xs text-slate-500 mb-4">Follow these steps in order to submit your RFTA packet to {agencyName}.</p>

        <div className="space-y-4">
          {submissionSteps.map((s) => (
            <div key={s.num} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">{s.num}</div>
                {s.num < submissionSteps.length && <div className="w-px flex-1 bg-blue-200 mt-1" />}
              </div>
              <div className="pb-4 flex-1">
                <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                {"link" in s && s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> {s.linkLabel} <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {"action" in s && s.action === "download" && (
                  <button onClick={downloadRFTA}
                    className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Download RFTA Packet (PDF)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Data Review ──────────────────────────────── */}
      <h3 className="text-base font-bold text-slate-900 mb-3">Application Data Review</h3>
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200"><h4 className="text-sm font-bold text-slate-800">{s.title}</h4></div>
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

        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200"><h4 className="text-sm font-bold text-slate-800">HQS Inspection Prep</h4></div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex-1">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${hqsTotalCount > 0 ? (hqsCheckedCount / hqsTotalCount) * 100 : 0}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{hqsCheckedCount}/{hqsTotalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────── */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button onClick={downloadRFTA} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
          <Download className="w-4 h-4" /> Download RFTA Packet
        </button>
        <button onClick={saveDraft} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Draft"}
        </button>
      </div>

      {/* ── Additional resources ─────────────────────── */}
      <div className="mt-4 space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Important:</strong> The downloaded RFTA packet is pre-filled for your convenience, but you must still sign the official forms. {isDC ? "DCHA requires submission via the Owner Portal." : "HAPGC requires in-person or mailed submission."} Do NOT allow the tenant to move in until the unit passes inspection and the HAP contract is executed.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={FORM_URLS.hud52517} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
            <FileText className="w-3 h-3" /> HUD-52517 PDF <ExternalLink className="w-3 h-3" />
          </a>
          {isDC ? (
            <>
              <a href={FORM_URLS.dchaRfta} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                <FileText className="w-3 h-3" /> DCHA RFTA Packet <ExternalLink className="w-3 h-3" />
              </a>
              <a href={FORM_URLS.dchaPortal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                <ExternalLink className="w-3 h-3" /> DCHA Owner Portal <ExternalLink className="w-3 h-3" />
              </a>
            </>
          ) : (
            <a href={FORM_URLS.hapgcLandlordPacket} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              <FileText className="w-3 h-3" /> HAPGC Landlord Packet <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
            <FileText className="w-3 h-3" /> IRS W-9 Form <ExternalLink className="w-3 h-3" />
          </a>
          {pre1978 && (
            <>
              <a href={isDC ? "https://doee.dc.gov/publication/lead-based-paint-consultant-companies" : "https://mde.maryland.gov/programs/land/LeadPoisoningPrevention/Pages/index.aspx"} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-3 h-3" /> Lead Inspection Services <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://apps.hud.gov/offices/lead/training/visualassessment/h00101.htm" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                <Shield className="w-3 h-3" /> HUD Lead Assessment Training <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
