import type { TenantContext, LeaseSummary } from "./types";

// TODO: LeaseSummary will be generated from uploaded lease PDF via OCR/parsing pipeline; mock for now. See lease-review extract-text for PDF parsing.
export const MOCK_LEASE_SUMMARY: LeaseSummary = {
  plainEnglishSummary: [
    "12-month lease starting March 1, 2025. Rent $1,850 due on the 1st of each month.",
    "Security deposit $1,850 held in a separate account; must be returned within 30 days of move-out per DC law.",
    "Landlord must give 48 hours notice before entry except in emergency.",
    "Tenant may request lease break with 60 days notice; early termination fee may apply per lease.",
    "Late fee: $75 after 5-day grace period. Repeated late payment may affect renewal.",
  ],
  keyTerms: [
    {
      id: "rent-due-date",
      termName: "Rent due date",
      whatItMeans: "Rent is due on the 1st of each month.",
      whyItMatters: "Paying after the due date can trigger late fees and affect your record.",
      negotiationTip: "If you need a different due date, ask before signing; some landlords allow a 3–5 day shift.",
      clauseExcerpt: "Tenant shall pay rent of $1,850 on or before the 1st day of each month.",
      relatedRights: "DC rent payment and late fee rules; grace period requirements.",
    },
    {
      id: "grace-period",
      termName: "Grace period",
      whatItMeans: "You have 5 days after the 1st before a late fee applies.",
      whyItMatters: "DC law limits when late fees can be charged; your lease specifies 5 days.",
      negotiationTip: "Document any delays (e.g. banking) and communicate with management if you need a waiver.",
      clauseExcerpt: "A late fee of $75 shall apply if rent is not received by the 6th.",
      relatedRights: "DC limits on late fees; waiver policies.",
    },
    {
      id: "entry-notice",
      termName: "Entry notice",
      whatItMeans: "Landlord must give you at least 48 hours notice before entering, except in emergency.",
      whyItMatters: "You have a right to privacy; unannounced entry may be illegal.",
      negotiationTip: "If entry is needed urgently, ask for written notice and keep a log.",
      clauseExcerpt: "Landlord shall provide 48 hours written notice except in case of emergency.",
      relatedRights: "DC entry and privacy; 48-hour notice requirement.",
    },
    {
      id: "lease-break",
      termName: "Lease break",
      whatItMeans: "You can request to end the lease early with 60 days notice; an early termination fee may apply.",
      whyItMatters: "Breaking a lease without following the clause can lead to liability for remaining rent.",
      negotiationTip: "Ask for the exact fee in writing and whether subletting or lease assignment is allowed.",
      clauseExcerpt: "Tenant may terminate early with 60 days notice; one month rent as early termination fee.",
      relatedRights: "DC early termination; subletting and assignment.",
    },
    {
      id: "repairs",
      termName: "Repairs",
      whatItMeans: "Landlord is responsible for habitability repairs (heat, water, safety). You must report issues in writing.",
      whyItMatters: "DC law requires landlords to maintain habitable conditions; you have repair-and-deduct rights in some cases.",
      negotiationTip: "Keep copies of all repair requests and follow up in writing.",
      clauseExcerpt: "Landlord shall maintain premises in habitable condition; Tenant shall report needed repairs promptly.",
      relatedRights: "DC habitability and repair-and-deduct; written notice requirements.",
    },
  ],
  riskFlags: [
    {
      label: "Late fee after 5 days",
      severity: "medium",
      explanation: "Your lease allows a $75 late fee if rent is not received by the 6th. Pay on time or request a one-time waiver in writing.",
    },
  ],
};

export const MOCK_TENANT_CONTEXT: TenantContext = {
  tenantId: "t1",
  propertyId: "p1",
  unitLabel: "Apt 2B",
  propertyAddress: "1607 Gainesville St SE, Washington, DC 20020",
  jurisdiction: "dc",
  rent: {
    amount: 1850,
    dueDay: 1,
    gracePeriodDays: 5,
    waiverInfo: "First late fee may be waived once per 12 months if you request in writing before the 6th.",
  },
  lease: {
    startDate: "2025-03-01",
    endDate: "2026-02-28",
    rentAmount: 1850,
    renewalType: "fixed",
    breakClause: "60 days notice; one month rent as early termination fee",
    lateFeeClause: "$75 after 5-day grace period",
    entryNoticeClause: "48 hours except emergency",
    repairResponsibilityClause: "Landlord maintains habitability; tenant reports in writing",
  },
  deposit: {
    amount: 1850,
    bankName: "Sample Bank",
    accountMasked: "****4567",
    receivedDate: "2025-02-25",
  },
  leaseSummary: MOCK_LEASE_SUMMARY,
  payments: [
    { id: "pay1", date: "2025-02-28", amount: 1850, type: "rent", status: "paid", note: "March 2025" },
    { id: "pay2", date: "2025-03-30", amount: 1850, type: "rent", status: "paid", note: "April 2025" },
    { id: "pay3", date: "2025-04-28", amount: 1850, type: "rent", status: "paid", note: "May 2025" },
  ],
  requests: [
    {
      id: "req1",
      subject: "Kitchen sink leak",
      description: "Slow leak under the sink; small puddle after use.",
      status: "scheduled",
      submittedAt: "2025-05-01T10:00:00Z",
      updatedAt: "2025-05-03T14:00:00Z",
      category: "plumbing",
      timelineNote: "Technician scheduled for May 10.",
    },
  ],
  messages: [
    { id: "msg1", subject: "Rent reminder – June", lastMessageAt: "2025-05-25T09:00:00Z", unread: 0 },
    { id: "msg2", subject: "Entry notice – maintenance", lastMessageAt: "2025-05-02T11:00:00Z", unread: 1, isNotice: true },
  ],
  notices: [
    {
      id: "n1",
      title: "Rent due June 1",
      body: "Rent of $1,850 is due on June 1. Grace period ends June 6.",
      date: "2025-05-25",
      type: "rent_due",
      read: false,
    },
    {
      id: "n2",
      title: "Entry notice – May 10",
      body: "Maintenance will enter between 9 AM–12 PM on May 10 for sink repair.",
      date: "2025-05-05",
      type: "entry",
      read: true,
    },
  ],
};
