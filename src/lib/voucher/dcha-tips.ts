/**
 * DCHA Request for Tenancy Approval (RTA) — AI Guidance Tips
 *
 * Static, pre-written field-level guidance for landlords filling out
 * the DC Housing Authority voucher application. Each tip includes
 * practical advice, common mistakes, and DCHA-specific requirements.
 */

export type FieldTip = {
  title: string;
  tip: string;
  commonMistake?: string;
  dchaRequirement?: string;
};

export const FIELD_TIPS: Record<string, FieldTip> = {
  // ── Owner Information ──────────────────────────────────────────
  ownerName: {
    title: "Owner / Entity Name",
    tip: "Enter the legal name exactly as it appears on your property deed or LLC registration. DCHA cross-references ownership records.",
    commonMistake: "Using a nickname or DBA instead of the legal entity name. This causes delays during verification.",
    dchaRequirement: "Must match the name on the W-9 you submit to DCHA.",
  },
  ownerType: {
    title: "Ownership Type",
    tip: "Select how you hold title to the property. If you own through an LLC, select 'LLC' — DCHA needs the entity's EIN, not your personal SSN.",
    commonMistake: "Selecting 'Individual' when the property is held in an LLC. This creates a mismatch with deed records.",
  },
  ownerAddress: {
    title: "Owner Mailing Address",
    tip: "This is where DCHA will mail HAP (Housing Assistance Payment) checks if you choose paper checks. Many landlords use a P.O. Box or business address.",
    dchaRequirement: "Must be a valid US mailing address. DCHA does not send payments internationally.",
  },
  ownerPhone: {
    title: "Contact Phone",
    tip: "Provide a number where DCHA can reach you for inspection scheduling and urgent communications. DCHA inspectors call to schedule HQS visits.",
    commonMistake: "Providing a number that goes to voicemail and never gets checked. Missed inspector calls delay the process by weeks.",
  },
  ownerEmail: {
    title: "Email Address",
    tip: "DCHA sends approval notices, HAP contract documents, and inspection results via email. Use an address you check regularly.",
  },
  taxIdType: {
    title: "Tax ID Type",
    tip: "If you own the property personally, use your SSN. If owned through an LLC, corporation, or partnership, use the entity's EIN (Employer Identification Number).",
    dchaRequirement: "DCHA reports HAP payments to the IRS. The tax ID must match your W-9 exactly.",
  },

  // ── Property & Unit Details ────────────────────────────────────
  propertyAddress: {
    title: "Property Address",
    tip: "Enter the full street address of the rental unit. This must match what's on the tenant's voucher paperwork.",
    dchaRequirement: "The property must be located within DCHA's jurisdiction (Washington, DC).",
  },
  unitNumber: {
    title: "Unit Number",
    tip: "If the property is a single-family home, you can leave this blank or enter 'SFH'. For multi-unit buildings, enter the specific unit number.",
  },
  yearBuilt: {
    title: "Year Built",
    tip: "This determines lead-based paint disclosure requirements. Properties built before 1978 require a lead-free certificate or valid lead inspection report.",
    commonMistake: "Not having a lead inspection ready for pre-1978 properties. DCHA will not approve tenancy without it.",
    dchaRequirement: "Pre-1978 properties must provide EPA-approved lead inspection results. This is a federal requirement under 24 CFR 35.",
  },
  numberOfBedrooms: {
    title: "Number of Bedrooms",
    tip: "Must match or be within the voucher's bedroom size authorization. A family with a 2-bedroom voucher can rent a 1, 2, or 3-bedroom unit, but the payment standard is based on the voucher size.",
    dchaRequirement: "DCHA uses the Payment Standard for the voucher bedroom size, not the actual unit size. Larger units don't mean higher HAP.",
  },
  squareFootage: {
    title: "Square Footage",
    tip: "Approximate total living area. DCHA uses this for rent reasonableness comparisons — your rent should be in line with similar-sized units in the area.",
  },
  propertyType: {
    title: "Property Type",
    tip: "Select the type that best describes your rental property. This affects HQS inspection requirements — multi-unit buildings have additional common area requirements.",
  },
  isLeadFree: {
    title: "Lead-Free Status",
    tip: "If your property was built before 1978 and has been certified lead-free by a DC-licensed inspector, check this box. Otherwise, you'll need to provide a lead inspection report.",
    dchaRequirement: "DC requires lead-free certificates for all pre-1978 rental units with children under 6. DCHA enforces this strictly.",
  },
  leadInspectionDate: {
    title: "Lead Inspection Date",
    tip: "Enter the date of the most recent lead inspection. DC lead-free certificates are valid for the life of the property if no renovation disturbs painted surfaces.",
  },

  // ── RTA Form Fields ────────────────────────────────────────────
  requestedRent: {
    title: "Requested Monthly Rent",
    tip: "DCHA uses Fair Market Rent (FMR) limits published by HUD. DC FMR for 2025-2026: Studio $1,672, 1BR $1,742, 2BR $2,001, 3BR $2,575, 4BR $2,817. Setting rent above 110% of FMR typically requires a rent reasonableness study and may delay approval by 2-4 weeks.",
    commonMistake: "Setting rent significantly above FMR. DCHA will request a rent reduction or conduct a lengthy reasonableness study.",
    dchaRequirement: "Rent must pass DCHA's rent reasonableness test — comparable to unassisted units of similar size, type, and location.",
  },
  securityDeposit: {
    title: "Security Deposit",
    tip: "DC law limits security deposits to one month's rent (DC Code § 42-3502.17). The deposit amount must be the same as what you'd charge a non-voucher tenant.",
    commonMistake: "Charging a higher deposit for voucher tenants. This is source-of-income discrimination under the DC Human Rights Act (DC Code § 2-1402.21).",
    dchaRequirement: "DCHA does not pay security deposits. The tenant is responsible. You cannot require the deposit before DCHA approval.",
  },
  utilitiesIncluded: {
    title: "Utilities Included in Rent",
    tip: "DCHA calculates a Utility Allowance based on unit size and which utilities the tenant pays. Including more utilities in rent means a higher gross rent to DCHA, potentially exceeding the payment standard. If the tenant pays utilities, DCHA deducts the utility allowance from the tenant's share.",
    dchaRequirement: "You must specify every utility and who pays for it. This directly affects the HAP calculation.",
  },
  proposedLeaseStartDate: {
    title: "Proposed Lease Start Date",
    tip: "DCHA approval typically takes 2-4 weeks after RTA submission, plus the HQS inspection must pass. Set the start date at least 30-45 days from submission to avoid delays.",
    commonMistake: "Setting the start date too soon. If DCHA hasn't approved by the start date, you may need to submit an amended RTA with a new date.",
    dchaRequirement: "The lease cannot begin before DCHA approval and HAP contract execution. Rent paid before HAP execution is not reimbursable.",
  },
  proposedLeaseEndDate: {
    title: "Proposed Lease End Date",
    tip: "DCHA requires an initial lease term of at least 12 months. Most landlords use a standard 12-month term.",
    dchaRequirement: "Minimum 12-month initial lease term required. After the initial term, the lease must allow month-to-month continuation.",
  },
  tenantName: {
    title: "Tenant Name",
    tip: "Enter the name exactly as it appears on the tenant's voucher documents. Mismatches between your lease and DCHA records cause processing delays.",
  },
  voucherNumber: {
    title: "Voucher Number",
    tip: "The tenant should provide this from their voucher packet. It's usually in the format 'DC-XXXXX' or similar. This links your RTA to their case file.",
    dchaRequirement: "Required for DCHA to process the RTA. Without it, the application cannot be matched to a case.",
  },
  numberOfOccupants: {
    title: "Number of Occupants",
    tip: "Include all persons who will live in the unit, including children. This must match the tenant's family composition on file with DCHA.",
    dchaRequirement: "DCHA uses occupancy to determine voucher bedroom size. Discrepancies trigger additional review.",
  },

  // ── Lease Addendum ─────────────────────────────────────────────
  hapPayeeName: {
    title: "HAP Payee Name",
    tip: "This is who receives the monthly Housing Assistance Payment from DCHA. Usually the property owner or management company. Must match your W-9.",
  },
  hapPayeeAddress: {
    title: "HAP Payment Address",
    tip: "Where DCHA sends your monthly HAP check. Consider setting up direct deposit through DCHA for faster, more reliable payments.",
    commonMistake: "Not setting up direct deposit. Paper checks can be delayed by mail and are harder to track.",
  },

  // ── General Process Tips ───────────────────────────────────────
  overviewTimeline: {
    title: "DCHA RTA Timeline",
    tip: "Typical timeline: Submit RTA (Day 1) → DCHA reviews rent reasonableness (Days 3-10) → HQS inspection scheduled (Days 10-20) → Approval or corrections needed (Days 20-30) → HAP contract executed (Days 25-35). Total: approximately 4-6 weeks from submission to first HAP payment.",
  },
  overviewDocuments: {
    title: "Documents You'll Need",
    tip: "Before starting, gather: (1) Property deed or LLC documentation, (2) W-9 form, (3) Valid lead inspection report (if pre-1978), (4) Proof of ownership or management authority, (5) Current insurance documentation, (6) Tenant's voucher information packet.",
  },
};
