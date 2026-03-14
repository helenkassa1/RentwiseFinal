// ============================================
// RentWise Legal Citations Data Layer
// Maps common lease issues to statutory basis
// Used for display and grounding AI outputs
// ============================================

export type LegalCitation = {
  code: string;
  title: string;
  summary: string;
  url: string | null;
};

export const DC_CITATIONS: Record<string, LegalCitation> = {
  prohibitedWaivers: {
    code: "14 DCMR § 304",
    title: "Prohibited Waiver Clauses",
    summary: "Landlords may not include lease provisions that waive tenant rights under DC law",
    url: "https://dcrules.elaws.us/dcmr/14-304",
  },
  securityDepositLimit: {
    code: "DC Code § 42-3502.17",
    title: "Security Deposit Limitations",
    summary: "Security deposit may not exceed one month\u2019s rent for most units",
    url: null,
  },
  retaliationProtection: {
    code: "DC Code § 42-3505.02",
    title: "Retaliatory Action Prohibited",
    summary: "Landlords may not retaliate against tenants who exercise legal rights",
    url: null,
  },
  repairTimelines: {
    code: "14 DCMR § 501",
    title: "Housing Code Violations and Repairs",
    summary: "Landlords must address emergency repairs within 24 hours, serious non-emergency issues within 3\u20137 days",
    url: null,
  },
  selfHelpEviction: {
    code: "DC Code § 42-3505.01",
    title: "Eviction Procedures",
    summary: "Self-help evictions are illegal; landlords must follow judicial eviction process",
    url: null,
  },
  juryTrialWaiver: {
    code: "14 DCMR § 304.1(c)",
    title: "Jury Trial Waiver Prohibition",
    summary: "Lease provisions waiving right to jury trial are void and unenforceable",
    url: null,
  },
  lateFeeLimits: {
    code: "DC Code § 42-3505.31",
    title: "Late Fee Limitations",
    summary: "Late fees may not exceed 5% of monthly rent",
    url: null,
  },
  rentIncrease: {
    code: "DC Code § 42-3502.08",
    title: "Rent Increase Limitations",
    summary: "Rent increases in rent-stabilized units are limited and require proper notice",
    url: null,
  },
  sourceOfIncome: {
    code: "DC Code § 2-1402.21",
    title: "Source of Income Discrimination",
    summary: "It is unlawful to discriminate against tenants based on source of income, including housing vouchers",
    url: null,
  },
  leadPaintDisclosure: {
    code: "DC Code § 42-3251",
    title: "Lead Paint Disclosure Requirements",
    summary: "Landlords must disclose known lead-based paint hazards in dwellings built before 1978",
    url: null,
  },
  landlordDisclosures: {
    code: "DC Code § 42-3502.22",
    title: "Required Landlord Disclosures",
    summary: "Landlords must provide specific disclosures regarding tenant rights, housing conditions, and ownership",
    url: null,
  },
};

export const MARYLAND_CITATIONS: Record<string, LegalCitation> = {
  securityDeposit: {
    code: "MD Code, Real Property § 8-203",
    title: "Security Deposit Requirements",
    summary: "Security deposit may not exceed two months\u2019 rent; must be returned within 45 days",
    url: null,
  },
  habitability: {
    code: "MD Code, Real Property § 8-211",
    title: "Implied Warranty of Habitability",
    summary: "Landlord must maintain rental property in habitable condition; tenant may seek rent escrow for violations",
    url: null,
  },
  leadPaint: {
    code: "MD Code, Environment § 6-801",
    title: "Lead Paint Disclosure",
    summary: "Landlord must register property, provide lead risk reduction certificate, and disclose known lead hazards",
    url: null,
  },
  evictionProcess: {
    code: "MD Code, Real Property § 8-401",
    title: "Eviction Procedures",
    summary: "Landlord must provide proper written notice and obtain court order before eviction",
    url: null,
  },
  retaliation: {
    code: "MD Code, Real Property § 8-208",
    title: "Landlord Retaliation Prohibited",
    summary: "Landlords may not retaliate against tenants who exercise their legal rights or report violations",
    url: null,
  },
  tenantBillOfRights: {
    code: "MD Code, Housing § 5-101",
    title: "Tenant Bill of Rights",
    summary: "Maryland requires landlords to provide tenants with a written bill of rights at lease signing",
    url: null,
  },
  backgroundChecks: {
    code: "MD Code, Real Property § 8-218",
    title: "Criminal Background Checks",
    summary: "Limitations on use of criminal background in tenant screening",
    url: null,
  },
};

export const PG_COUNTY_CITATIONS: Record<string, LegalCitation> = {
  rentStabilization: {
    code: "PG County CB-029-2024",
    title: "Rent Stabilization Act (2024)",
    summary: "Limits annual rent increases to 6% or CPI-U + 3% (whichever is lower) for qualifying properties",
    url: null,
  },
  securityDeposit: {
    code: "MD Code, Real Property § 8-203",
    title: "Security Deposit Limits",
    summary: "Security deposit may not exceed two months\u2019 rent",
    url: null,
  },
  habitability: {
    code: "MD Code, Real Property § 8-211",
    title: "Implied Warranty of Habitability",
    summary: "Landlord must maintain rental property in habitable condition; tenant may seek rent escrow for violations",
    url: null,
  },
  leadPaint: {
    code: "MD Code, Environment § 6-801",
    title: "Lead Paint Disclosure",
    summary: "Landlord must register property, provide lead risk reduction certificate, and disclose known lead hazards",
    url: null,
  },
  evictionProcess: {
    code: "MD Code, Real Property § 8-401",
    title: "Eviction Procedures",
    summary: "Landlord must provide proper written notice and obtain court order before eviction",
    url: null,
  },
  discriminationProtection: {
    code: "PG County Code § 2-186",
    title: "Fair Housing Protections",
    summary: "Source of income (including housing vouchers) is a protected class in PG County",
    url: null,
  },
  lateFees: {
    code: "PG County Code § 13-157",
    title: "Late Fee Limitations",
    summary: "Limits and rules for late fees charged to tenants",
    url: null,
  },
  landlordTenant: {
    code: "PG County Code §§ 13-135\u201313-180",
    title: "Landlord-Tenant Regulations",
    summary: "Comprehensive landlord-tenant regulations for Prince George\u2019s County",
    url: null,
  },
};

// All citations indexed by jurisdiction for easy lookup
export const CITATIONS_BY_JURISDICTION: Record<string, Record<string, LegalCitation>> = {
  dc: DC_CITATIONS,
  maryland: MARYLAND_CITATIONS,
  pg_county: PG_COUNTY_CITATIONS,
};

// Utility to find a citation by code string (fuzzy match)
export function findCitationByCode(code: string, jurisdiction?: string): LegalCitation | null {
  const normalise = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const needle = normalise(code);

  const searchIn = jurisdiction
    ? [CITATIONS_BY_JURISDICTION[jurisdiction]].filter(Boolean)
    : Object.values(CITATIONS_BY_JURISDICTION);

  for (const citations of searchIn) {
    for (const citation of Object.values(citations)) {
      if (normalise(citation.code) === needle || needle.includes(normalise(citation.code)) || normalise(citation.code).includes(needle)) {
        return citation;
      }
    }
  }
  return null;
}
