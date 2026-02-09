import type { Category, RuleCard } from "./types";

/**
 * All 12 DC categories. Content is jurisdiction-specific via ruleCardsByJurisdiction.
 * Two categories are filled end-to-end for DC + PG: eviction-termination, repairs-withholding.
 */
export const TENANT_RIGHTS_CATEGORIES: Category[] = [
  {
    id: "habitability",
    title: "Habitability & Housing Conditions",
    description: "Your right to a safe, livable home and minimum standards.",
    icon: "Home",
    subtopics: [{ id: "standards", title: "Habitability standards" }, { id: "inspections", title: "Inspections" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "rent-fees",
    title: "Rent, Fees & Financial Protections",
    description: "Rent payment rules, fees, and what landlords can charge.",
    icon: "DollarSign",
    subtopics: [{ id: "fees", title: "Fees and charges" }, { id: "receipts", title: "Rent receipts" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "lease-contract",
    title: "Lease & Contract Rights",
    description: "Lease terms, renewals, and contract fairness.",
    icon: "FileText",
    subtopics: [{ id: "terms", title: "Lease terms" }, { id: "renewal", title: "Renewal and termination" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "eviction-termination",
    title: "Eviction & Termination Protections",
    description: "Legal eviction process, notice requirements, and your rights in court.",
    icon: "ShieldAlert",
    subtopics: [
      { id: "notice-to-quit", title: "Notice to quit / vacate" },
      { id: "court-process", title: "Court process" },
      { id: "just-cause", title: "Just cause (DC)" },
      { id: "lockouts", title: "Lockouts & self-help" },
    ],
    ruleCardsByJurisdiction: {
      dc: [
        {
          subtopicId: "lockouts",
          title: "Self-help eviction is illegal",
          legalCites: [
            { label: "D.C. Code", cite: "D.C. Code § 42-3505.01", url: "https://code.dccouncil.gov/us/dc/code/sections/42-3505.01.html" },
          ],
          plainEnglish:
            "A landlord cannot lock you out, remove your belongings, or shut off utilities without a court order. Only the court can order you to leave after a proper case.",
          deadlines: [
            { label: "Notice to vacate (non-payment)", detail: "30 days written notice required before filing. Verify current DCMR/OTA guidance.", verify: true },
                          ],
          steps: [
            "If you are locked out or utilities are shut off, call the police and document it.",
            "Contact the Office of the Tenant Advocate (OTA) and consider filing for wrongful eviction.",
            "Do not abandon the unit; get legal help to assert your right to re-enter.",
          ],
          evidence: ["Written notice (if any)", "Photos/videos of lockout or utility shutoff", "Police report number", "Lease and rent payment records"],
          contacts: [
            { name: "Office of the Tenant Advocate (OTA)", url: "https://ota.dc.gov/", description: "Tenant advocacy and information" },
            { name: "DC Superior Court Landlord-Tenant Branch", description: "Where eviction cases are filed" },
          ],
        },
        {
          subtopicId: "notice-to-quit",
          title: "Notice before court filing",
          legalCites: [
            { label: "D.C. Code / OTA", cite: "D.C. Code Title 42, Ch. 35; verify notice periods with OTA", verify: true },
          ],
          plainEnglish:
            "In D.C., the landlord must give you proper written notice before filing an eviction case. The type and length of notice depend on the reason (non-payment, lease violation, etc.).",
          deadlines: [
            { label: "Non-payment", detail: "Typically 30 days notice; verify with OTA or legal aid.", verify: true },
            { label: "Lease violation", detail: "Depends on the violation; verify with OTA.", verify: true },
          ],
          steps: [
            "Read the notice carefully and note the date you received it.",
            "If you can cure the issue (e.g., pay rent), do so before the deadline if the notice allows it.",
            "Contact OTA or legal aid before the court date.",
            "Attend any court hearing; you have the right to be heard.",
          ],
          evidence: ["Copy of the notice", "Proof of service date", "Lease", "Rent payment history", "Any written communication with landlord"],
          contacts: [
            { name: "Office of the Tenant Advocate", url: "https://ota.dc.gov/" },
            { name: "DC Bar Pro Bono Center", url: "https://www.dcbar.org/for-the-public/pro-bono-center" },
          ],
        },
      ],
      pg: [
        {
          subtopicId: "lockouts",
          title: "Self-help eviction is illegal",
          legalCites: [
            { label: "Maryland law", cite: "Md. Code, Real Property Title 8", url: "https://law.justia.com/codes/maryland/2022/real-property/title-8/" },
          ],
          plainEnglish:
            "In Maryland (including PG County), a landlord cannot lock you out, remove your belongings, or shut off utilities without going through the court process. Self-help eviction is illegal.",
          deadlines: [
            { label: "Notice required before filing", detail: "Maryland law requires proper notice before filing for repossession. Verify notice periods for your situation with legal aid.", verify: true },
          ],
          steps: [
            "If you are locked out or utilities are shut off, call the police and get a report.",
            "Contact Maryland Legal Aid or a tenant attorney; you may have a claim for wrongful eviction.",
            "Do not abandon the unit without legal advice.",
          ],
          evidence: ["Written notice (if any)", "Photos of lockout or utility shutoff", "Police report", "Lease and payment records"],
          contacts: [
            { name: "Maryland Legal Aid", url: "https://www.mdlab.org/", description: "Free legal help for eligible tenants" },
            { name: "PG County DPIE", url: "https://www.princegeorgescountymd.gov/206/Inspections", description: "Code enforcement" },
          ],
        },
        {
          subtopicId: "notice-to-quit",
          title: "Notice before court",
          legalCites: [
            { label: "Md. Real Property", cite: "Md. Code, Real Property § 8-401 et seq.", verify: true },
          ],
          plainEnglish:
            "In Maryland, the landlord must give you proper notice before filing an eviction case. PG County follows Maryland state law for eviction procedure. Notice type and length depend on the reason.",
          deadlines: [
            { label: "Non-payment / other", detail: "Verify exact notice periods with Maryland Legal Aid or the court.", verify: true },
          ],
          steps: [
            "Read the notice and note the date received.",
            "If the notice allows you to fix the problem (e.g., pay rent), do so within the time allowed if possible.",
            "Contact Maryland Legal Aid or a tenant attorney before the court date.",
            "Attend all court hearings.",
          ],
          evidence: ["Copy of notice", "Lease", "Rent records", "Written correspondence with landlord"],
          contacts: [
            { name: "Maryland Legal Aid", url: "https://www.mdlab.org/" },
            { name: "District Court of Maryland (eviction cases)", description: "Where eviction cases are heard" },
          ],
        },
      ],
    },
    scenarioShortcuts: [
      { id: "eviction-dc", title: "Evictions in D.C.", description: "Notice, court process, and just cause", subtopicId: "notice-to-quit" },
      { id: "eviction-pg", title: "Evictions in PG County", description: "Maryland eviction process and notice", subtopicId: "notice-to-quit" },
    ],
  },
  {
    id: "privacy-entry",
    title: "Privacy & Entry Rights",
    description: "When and how your landlord can enter your home.",
    icon: "Lock",
    subtopics: [{ id: "notice", title: "Notice before entry" }, { id: "emergency", title: "Emergency entry" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "rent-control",
    title: "Rent Control & Rent Stabilization",
    description: "Rent increase limits and stabilization rules.",
    icon: "TrendingDown",
    subtopics: [{ id: "dc-rent-control", title: "D.C. rent control" }, { id: "pg-prsa", title: "PG County PRSA" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "repairs-withholding",
    title: "Repairs, Withholding & \"Repair and Deduct\"",
    description: "Getting repairs done, rent escrow, and repair-and-deduct options.",
    icon: "Wrench",
    subtopics: [
      { id: "request-repairs", title: "Requesting repairs" },
      { id: "withhold-escrow", title: "Withholding rent / escrow" },
      { id: "repair-deduct", title: "Repair and deduct" },
    ],
    ruleCardsByJurisdiction: {
      dc: [
        {
          subtopicId: "request-repairs",
          title: "Requesting repairs in D.C.",
          legalCites: [
            { label: "D.C. Code", cite: "D.C. Code § 42-3505.01", url: "https://code.dccouncil.gov/us/dc/code/sections/42-3505.01.html" },
          ],
          plainEnglish:
            "Landlords must keep the rental in habitable condition. For emergencies (e.g., no heat, major leak), landlords are expected to act quickly. You should notify the landlord in writing and keep a copy.",
          deadlines: [
            { label: "Emergency repairs", detail: "Landlords often must address life/safety issues within 24–72 hours; verify with DCRA/OTA.", verify: true },
            { label: "Non-emergency", detail: "Reasonable time; document all requests and follow-up.", verify: false },
          ],
          steps: [
            "Notify the landlord in writing (email or letter) and keep a copy with the date.",
            "Describe the problem and, if applicable, that it affects health or safety.",
            "Take dated photos and keep records of any communication.",
            "If the landlord does not respond, contact DCRA for an inspection or OTA for next steps.",
            "Do not withhold rent without following the legal process; ask OTA about escrow or repair-and-deduct.",
          ],
          evidence: ["Written repair requests (dated)", "Photos/videos of conditions", "Lease", "All correspondence with landlord"],
          contacts: [
            { name: "DCRA", url: "https://dcra.dc.gov/", description: "Housing code, inspections" },
            { name: "Office of the Tenant Advocate", url: "https://ota.dc.gov/" },
          ],
        },
        {
          subtopicId: "withhold-escrow",
          title: "Withholding rent safely in D.C.",
          legalCites: [
            { label: "D.C. Code / OTA", cite: "D.C. Code § 42-3505.01; verify escrow procedure with OTA", verify: true },
          ],
          plainEnglish:
            "In D.C., you may have options to pay rent into court escrow or follow a specific process when the landlord fails to make required repairs. The exact steps and deadlines must be verified with OTA or legal aid.",
          deadlines: [
            { label: "Escrow / repair process", detail: "Verify deadlines with OTA or legal aid—do not withhold rent without following the legal process.", verify: true },
          ],
          steps: [
            "Get the repair request in writing and document the condition.",
            "Contact OTA or legal aid to confirm the correct escrow or repair-and-deduct process.",
            "Do not simply stop paying rent without legal guidance; it can lead to eviction.",
            "If you are told to pay into court escrow, do so by the required dates.",
          ],
          evidence: ["Written repair requests", "Photos", "Proof of rent payments", "OTA or legal aid notes"],
          contacts: [
            { name: "Office of the Tenant Advocate", url: "https://ota.dc.gov/" },
            { name: "DC Bar Pro Bono Center", url: "https://www.dcbar.org/for-the-public/pro-bono-center" },
          ],
        },
      ],
      pg: [
        {
          subtopicId: "request-repairs",
          title: "Requesting repairs in PG County / Maryland",
          legalCites: [
            { label: "Maryland law", cite: "Md. Code, Real Property Title 8, Subtitle 5", url: "https://law.justia.com/codes/maryland/2022/real-property/title-8/" },
            { label: "PG County", cite: "PG County § 13-162.02", summary: "Habitability" },
          ],
          plainEnglish:
            "Landlords must maintain the rental in habitable condition. You should notify the landlord in writing and keep copies. Maryland has a rent escrow process when landlords fail to make certain repairs.",
          deadlines: [
            { label: "Rent escrow (Maryland)", detail: "There are specific steps and deadlines for depositing rent with the court; verify with legal aid.", verify: true },
          ],
          steps: [
            "Notify the landlord in writing and keep a dated copy.",
            "Take photos and keep all correspondence.",
            "If the landlord does not make repairs, contact Maryland Legal Aid or the local health/code office.",
            "Ask legal aid about the Maryland rent escrow process—do not withhold rent without following it.",
          ],
          evidence: ["Written repair requests", "Photos", "Lease", "Correspondence with landlord"],
          contacts: [
            { name: "Maryland Legal Aid", url: "https://www.mdlab.org/" },
            { name: "PG County DPIE", url: "https://www.princegeorgescountymd.gov/206/Inspections" },
          ],
        },
      ],
    },
    scenarioShortcuts: [
      { id: "withhold-dc", title: "Withholding Rent Safely", description: "Legal steps before withholding rent in D.C.", subtopicId: "withhold-escrow" },
      { id: "deposit-timeline", title: "Security deposit return timeline", description: "When you can expect your deposit back" },
    ],
  },
  {
    id: "anti-discrimination",
    title: "Anti-Discrimination & Fair Housing",
    description: "Protected classes and your right to be free from discrimination.",
    icon: "Scale",
    subtopics: [{ id: "protected-classes", title: "Protected classes" }, { id: "voucher", title: "Source of income / voucher" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "organizing-retaliation",
    title: "Tenant Organizing & Retaliation Protections",
    description: "Your right to organize and protection from retaliation.",
    icon: "Users",
    subtopics: [{ id: "retaliation", title: "Retaliation" }, { id: "organizing", title: "Organizing" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "relocation-buyouts",
    title: "Relocation, Buyouts & Right to Return",
    description: "Relocation assistance, buyout offers, and right to return.",
    icon: "Home",
    subtopics: [{ id: "buyouts", title: "Buyouts" }, { id: "relocation", title: "Relocation" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "registration-licensing",
    title: "Registration, Licensing & Landlord Compliance",
    description: "Landlord registration and licensing requirements.",
    icon: "FileCheck",
    subtopics: [{ id: "registration", title: "Registration" }],
    ruleCardsByJurisdiction: {},
  },
  {
    id: "enforcement-remedies",
    title: "Enforcement & Legal Remedies",
    description: "How to enforce your rights and where to get help.",
    icon: "Gavel",
    subtopics: [{ id: "agencies", title: "Agencies" }, { id: "court", title: "Court options" }],
    ruleCardsByJurisdiction: {},
  },
];

export function getCategory(id: string): Category | undefined {
  return TENANT_RIGHTS_CATEGORIES.find((c) => c.id === id);
}

export function getRuleCardsForCategory(category: Category, jurisdiction: "dc" | "pg"): RuleCard[] {
  const cards = category.ruleCardsByJurisdiction?.[jurisdiction];
  if (!cards) return [];
  return cards;
}
