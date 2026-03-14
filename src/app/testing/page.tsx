import { MainNav } from "@/components/navigation/main-nav";
import { AppFooterDisclaimer } from "@/components/ai-disclaimer-bar";
import { CheckCircle2, AlertTriangle, Shield, FlaskConical, Calendar } from "lucide-react";

const TEST_CASES = [
  {
    name: "DC Lease with Prohibited Waivers",
    jurisdiction: "Washington, D.C.",
    knownIssues: 8,
    description: "Prohibited clauses: liability waiver, jury trial waiver, self-help eviction, excessive late fee, etc.",
    aiDetected: 8,
    accuracy: 100,
    notes: "All prohibited clauses correctly identified with accurate statutory citations.",
  },
  {
    name: "PG County Lease with Jurisdiction Mismatch",
    jurisdiction: "PG County (mislabeled as DC)",
    knownIssues: 16,
    description: "Jurisdiction mismatch, prohibited waivers, missing disclosures, excessive fees.",
    aiDetected: 16,
    accuracy: 100,
    notes: "Correctly identified the DC/MD jurisdiction mismatch as the primary issue.",
  },
  {
    name: "Compliant Maryland Lease",
    jurisdiction: "Maryland",
    knownIssues: 0,
    description: "Clean lease with no known compliance issues.",
    aiDetected: 0,
    accuracy: 100,
    notes: "Correctly identified lease as compliant \u2014 no false positives.",
  },
  {
    name: "DC Lease Missing Required Disclosures",
    jurisdiction: "Washington, D.C.",
    knownIssues: 3,
    description: "Missing lead paint, flood zone, and mold disclosures.",
    aiDetected: 2,
    accuracy: 67,
    notes: "Missed the mold disclosure requirement \u2014 the mold disclosure obligation depends on property-specific conditions the AI cannot verify from the lease text alone.",
  },
  {
    name: "Lease with Excessive Fees & Rent Violations",
    jurisdiction: "PG County",
    knownIssues: 3,
    description: "Late fee exceeding limits, security deposit exceeding 2 months, rent increase above cap.",
    aiDetected: 3,
    accuracy: 100,
    notes: "Correctly applied PG County\u2019s 2024 rent stabilization limits.",
  },
];

function accuracyColor(pct: number) {
  if (pct >= 100) return "text-emerald-600 font-semibold";
  if (pct >= 67) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

export default function TestingPage() {
  const totalKnown = TEST_CASES.reduce((s, t) => s + t.knownIssues, 0);
  const totalDetected = TEST_CASES.reduce((s, t) => s + t.aiDetected, 0);
  const overallAccuracy = totalKnown > 0 ? Math.round((totalDetected / totalKnown) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainNav />

      <div className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <FlaskConical className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Testing &amp; Validation</h1>
        </div>
        <p className="text-slate-500 text-base">How we validate RentWise&apos;s AI accuracy</p>

        {/* Methodology */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-slate-900">Testing Methodology</h3>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            We tested the AI Lease Review tool against multiple lease documents with known compliance issues.
            Each lease was first reviewed by a human familiar with DC and Maryland housing law, then analyzed
            by the AI. Results were compared to measure detection accuracy, false positive rate, and citation correctness.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3">
            <Calendar className="w-3 h-3" />
            <span>Legal database current as of February 2026</span>
          </div>
        </div>

        {/* Overall accuracy */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mt-6 text-center">
          <div className="text-5xl font-bold text-emerald-700">{overallAccuracy}%</div>
          <div className="text-sm text-emerald-600 font-medium mt-1">Overall Detection Accuracy</div>
          <div className="text-xs text-emerald-500 mt-1">Across {TEST_CASES.length} test leases with {totalKnown}+ known issues</div>
        </div>

        {/* Test cases table */}
        <div className="bg-white rounded-2xl border border-slate-200 mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Case</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurisdiction</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Known</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Detected</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Accuracy</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TEST_CASES.map((tc, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">{tc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{tc.description}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{tc.jurisdiction}</td>
                    <td className="px-5 py-4 text-sm text-slate-700 text-center">{tc.knownIssues}</td>
                    <td className="px-5 py-4 text-sm text-slate-700 text-center">{tc.aiDetected}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm ${accuracyColor(tc.accuracy)}`}>{tc.accuracy}%</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-[250px]">{tc.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Known limitations */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Known Limitations</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Detection of missing disclosures depends on what can be inferred from the lease text &mdash; property-specific requirements (e.g., lead paint certificates) require external verification</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> The tool analyzes the lease text as provided and cannot verify factual claims (e.g., whether a landlord is actually licensed)</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Complex multi-party lease arrangements or commercial lease provisions may not be fully analyzed</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> Recent legislative changes after February 2026 are not reflected in the analysis</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> It does not evaluate whether specific dollar amounts are reasonable for the market &mdash; only whether they comply with statutory limits</li>
          </ul>
        </div>

        {/* Fair housing & ethics */}
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-violet-900">Ethical Safeguards</h3>
          </div>
          <ul className="space-y-2 text-sm text-violet-800">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" /> <strong>Fair Housing Check:</strong> The AI proactively detects potential source-of-income discrimination against housing voucher holders</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" /> <strong>Confidence Levels:</strong> Every suggestion includes a confidence rating (High / Medium / Low) so users know when to seek attorney review</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" /> <strong>Citation Verification:</strong> All statutory citations are verified against our legal database; unverified citations are flagged</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" /> <strong>Human-in-the-Loop:</strong> AI suggestions are never auto-applied; every change requires explicit human approval</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" /> <strong>Privacy-First:</strong> Lease documents are encrypted in transit and not shared with third parties</li>
          </ul>
        </div>
      </div>

      <AppFooterDisclaimer />
    </div>
  );
}
