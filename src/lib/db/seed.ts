import { db } from "./index";
import { legalStatutes } from "./schema";

const statutes = [
  // ======== WASHINGTON D.C. ========
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code Title 42, Chapter 32",
    title: "Landlord and Tenant General Provisions",
    summary: "General rules governing the landlord-tenant relationship in the District of Columbia, including obligations of both parties, lease requirements, and general rights.",
    category: "general",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code Title 42, Chapter 35",
    title: "Rental Housing Generally (Rental Housing Act of 1985)",
    summary: "Comprehensive rental housing regulations including rent control provisions, registration requirements, and tenant protections in Washington D.C.",
    category: "rent_control",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code § 42-3505.01",
    title: "Eviction Procedures and Tenant Protections",
    summary: "Specifies the legal procedures a landlord must follow to evict a tenant in D.C. Landlords cannot use self-help eviction methods. All evictions must go through court. Tenants have the right to repair and deduct for certain maintenance issues.",
    category: "eviction",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code § 42-3502.22",
    title: "Required Landlord Disclosures",
    summary: "Lists all disclosures a D.C. landlord must provide to tenants, including information about rent control status, housing code violations, ownership information, and tenant rights.",
    category: "disclosures",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code § 2-1402.21",
    title: "DC Human Rights Act - Housing Discrimination Prohibited",
    summary: "Prohibits discrimination in housing based on race, color, religion, national origin, sex, age, marital status, personal appearance, sexual orientation, gender identity, familial status, family responsibilities, disability, matriculation, political affiliation, source of income, place of residence or business, and status as a victim of domestic violence.",
    category: "discrimination",
  },
  {
    jurisdiction: "dc" as const,
    code: "DCMR Title 14, Chapter 3",
    title: "Landlord and Tenant Regulations",
    summary: "Administrative regulations governing the landlord-tenant relationship in D.C., including maintenance standards, code enforcement, and regulatory procedures.",
    category: "general",
  },
  {
    jurisdiction: "dc" as const,
    code: "DCMR Title 14, § 14-304",
    title: "Prohibited Waiver Clauses in Rental Agreements",
    summary: "Lists clauses that are prohibited in D.C. rental agreements. Landlords cannot include provisions that waive tenant rights, including waivers of liability, jury trial rights, right to habitable premises, or right to legal process for eviction.",
    category: "prohibited_clauses",
  },
  {
    jurisdiction: "dc" as const,
    code: "DCMR Title 4, § 308",
    title: "Security Deposit Regulations",
    summary: "Governs security deposit collection, holding, interest, and return requirements in Washington D.C.",
    category: "security_deposit",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code § 42-2851.06",
    title: "Vouchers for Rental Housing Assistance",
    summary: "Governs the use of housing vouchers for rental assistance in D.C. Landlords cannot discriminate against tenants based on their use of housing vouchers as a source of income.",
    category: "voucher",
  },
  {
    jurisdiction: "dc" as const,
    code: "D.C. Code § 6-227",
    title: "Project-Based and Sponsor-Based Voucher Assistance",
    summary: "Establishes rules for project-based and sponsor-based housing voucher programs administered by the D.C. Housing Authority.",
    category: "voucher",
  },

  // ======== MARYLAND ========
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property § 8-203",
    title: "Security Deposit Requirements",
    summary: "Maryland landlords must return security deposits within 45 days of lease termination. Deposits are limited to two months' rent. Landlords must provide an itemized list of deductions and hold deposits in a separate account.",
    category: "security_deposit",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property § 8-208",
    title: "Landlord Retaliation Prohibited",
    summary: "Landlords in Maryland cannot retaliate against tenants who exercise their legal rights, file complaints, or join tenant organizations. Retaliation includes rent increases, decreased services, or threatened eviction.",
    category: "retaliation",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 1",
    title: "General Rules - Landlord and Tenant",
    summary: "General provisions governing the landlord-tenant relationship in Maryland, including definitions, applicability, and foundational rules.",
    category: "general",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 2",
    title: "Residential Leases",
    summary: "Specific rules governing residential lease agreements in Maryland, including required terms, prohibited practices, and tenant protections.",
    category: "leases",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 4",
    title: "Landlord's Remedies",
    summary: "Legal remedies available to landlords in Maryland, including eviction procedures, breach of lease, and distress for rent.",
    category: "eviction",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 5",
    title: "Tenant Remedies",
    summary: "Legal remedies available to tenants in Maryland, including rent escrow, repair and deduct, and constructive eviction claims.",
    category: "tenant_rights",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 5A",
    title: "Rental Housing - Victims of Domestic Violence",
    summary: "Protections for tenants who are victims of domestic violence, including the right to terminate a lease early and protections against eviction related to domestic violence incidents.",
    category: "domestic_violence",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property Title 8, Subtitle 9",
    title: "Access to Legal Representation in Eviction Cases",
    summary: "Provisions ensuring tenants facing eviction in Maryland have access to legal representation, including right to counsel programs.",
    category: "eviction",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD Real Property § 8-218",
    title: "Criminal Background Checks",
    summary: "Regulations governing the use of criminal background checks in tenant screening in Maryland.",
    category: "screening",
  },
  {
    jurisdiction: "maryland" as const,
    code: "MD State Gov't § 20-705",
    title: "Anti-Discrimination Provisions",
    summary: "Maryland's anti-discrimination law prohibiting housing discrimination based on race, color, religion, sex, familial status, national origin, marital status, sexual orientation, gender identity, disability, and source of income.",
    category: "discrimination",
  },

  // ======== PRINCE GEORGE'S COUNTY ========
  {
    jurisdiction: "pg_county" as const,
    code: "PG County Code § 13-156",
    title: "Security Deposits",
    summary: "Prince George's County regulations on security deposit collection and handling, supplementing Maryland state law.",
    category: "security_deposit",
  },
  {
    jurisdiction: "pg_county" as const,
    code: "PG County Code § 13-157",
    title: "Late Fees",
    summary: "Limits on late fees that landlords may charge tenants in Prince George's County. Late fees must be reasonable and comply with county regulations.",
    category: "fees",
  },
  {
    jurisdiction: "pg_county" as const,
    code: "PG County Code § 13-158",
    title: "Security Deposit Limits",
    summary: "Specific limits on security deposit amounts in Prince George's County, which may be more restrictive than Maryland state law.",
    category: "security_deposit",
  },
  {
    jurisdiction: "pg_county" as const,
    code: "PG County Code § 13-162.02",
    title: "Equipment and Habitability Standards",
    summary: "Requirements for equipment and habitability in rental properties in Prince George's County, including heating, plumbing, electrical, and structural standards.",
    category: "habitability",
  },
  {
    jurisdiction: "pg_county" as const,
    code: "PG County Code § 13-119",
    title: "Security Requirements",
    summary: "Security requirements for rental properties in Prince George's County, including locks, lighting, and other safety measures.",
    category: "safety",
  },
  {
    jurisdiction: "pg_county" as const,
    code: "PRSA 2024",
    title: "Permanent Rent Stabilization and Protection Act of 2024",
    summary: "PG County rent stabilization law limiting annual rent increases to the lesser of 6% or CPI-U plus 3%. Applies to most residential rental properties. Landlords must provide proper notice before any rent increase.",
    category: "rent_control",
  },

  // ======== FEDERAL ========
  {
    jurisdiction: "dc" as const,
    code: "42 U.S.C. §§ 3601-3619",
    title: "Fair Housing Act",
    summary: "Federal law prohibiting discrimination in housing based on race, color, religion, sex, familial status, national origin, and disability. Applies to all jurisdictions.",
    category: "discrimination",
  },
  {
    jurisdiction: "dc" as const,
    code: "15 U.S.C. § 1681",
    title: "Fair Credit Reporting Act (FCRA)",
    summary: "Requires landlords to provide adverse action notices when denying tenancy based on credit or background reports. Tenants have the right to dispute inaccurate information.",
    category: "screening",
  },
  {
    jurisdiction: "dc" as const,
    code: "24 CFR Part 982",
    title: "Housing Choice Voucher Program (Section 8)",
    summary: "Federal regulations governing the Housing Choice Voucher (Section 8) program, including landlord participation requirements, Housing Quality Standards, rent reasonableness, and payment procedures.",
    category: "voucher",
  },
];

export async function seedLegalDatabase() {
  console.log("🏛️ Seeding legal knowledge base...");

  for (const statute of statutes) {
    await db.insert(legalStatutes).values({
      ...statute,
      lastVerified: new Date(),
    }).onConflictDoNothing();
  }

  // Also seed federal statutes for maryland and pg_county
  const federalStatutes = statutes.filter(s =>
    ["42 U.S.C. §§ 3601-3619", "15 U.S.C. § 1681", "24 CFR Part 982"].includes(s.code)
  );

  for (const statute of federalStatutes) {
    for (const jurisdiction of ["maryland", "pg_county"] as const) {
      await db.insert(legalStatutes).values({
        ...statute,
        jurisdiction,
        lastVerified: new Date(),
      }).onConflictDoNothing();
    }
  }

  console.log(`✅ Seeded ${statutes.length} statutes`);
}

// Run directly
seedLegalDatabase()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
