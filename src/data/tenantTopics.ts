/**
 * Plain-English topic labels for Tenant Rights. Canonical legal category ids are used
 * for lookups; map to internal category id (e.g. eviction-termination) where needed.
 */
export type Jurisdiction = "dc" | "pg";

export type TopicCategoryId =
  | "habitability"
  | "rent_fees"
  | "lease_contract"
  | "eviction"
  | "privacy_entry"
  | "rent_control"
  | "repairs_withholding"
  | "antidiscrimination"
  | "organizing_retaliation"
  | "relocation_buyouts"
  | "registration_compliance"
  | "enforcement_remedies";

export type Topic = {
  id: TopicCategoryId;
  /** Plain-language title shown to users */
  uiTitle: string;
  uiDescription: string;
  /** Canonical legal category name (for detail header) */
  legalTitle: string;
  /** Used for urgency styling (badge + border) */
  urgency?: "urgent" | "normal";
  /** Shown in "Most common problems" */
  common?: boolean;
};

export const TOPICS: Topic[] = [
  {
    id: "eviction",
    uiTitle: "Facing eviction or told to move",
    uiDescription: "Notices, court steps, and how to respond.",
    legalTitle: "Eviction & Termination Protections",
    urgency: "urgent",
    common: true,
  },
  {
    id: "repairs_withholding",
    uiTitle: "Repairs not being done",
    uiDescription: "How to request fixes and document issues.",
    legalTitle: 'Repairs, Withholding & "Repair and Deduct"',
    urgency: "urgent",
    common: true,
  },
  {
    id: "rent_fees",
    uiTitle: "Rent increase, late fees, or extra charges",
    uiDescription: "What landlords can charge and when.",
    legalTitle: "Rent, Fees & Financial Protections",
    common: true,
  },
  {
    id: "privacy_entry",
    uiTitle: "Landlord entering without notice",
    uiDescription: "Notice rules, harassment, and what to do.",
    legalTitle: "Privacy & Entry Rights",
    common: true,
  },
  {
    id: "lease_contract",
    uiTitle: "Problems with my lease",
    uiDescription: "Lease terms, renewals, and changes.",
    legalTitle: "Lease & Contract Rights",
    common: true,
  },
  {
    id: "habitability",
    uiTitle: "Unsafe conditions (mold, no heat, pests)",
    uiDescription: "Your right to a safe, livable home.",
    legalTitle: "Habitability & Housing Conditions",
    urgency: "urgent",
    common: true,
  },
  {
    id: "rent_control",
    uiTitle: "Is my unit rent-controlled or protected?",
    uiDescription: "When special rent rules apply.",
    legalTitle: "Rent Control & Rent Stabilization",
  },
  {
    id: "antidiscrimination",
    uiTitle: "Discrimination or voucher issues",
    uiDescription: "Protected classes and source-of-income rights.",
    legalTitle: "Anti-Discrimination & Fair Housing",
  },
  {
    id: "organizing_retaliation",
    uiTitle: "Retaliation for complaining or organizing",
    uiDescription: "Protections when you speak up.",
    legalTitle: "Tenant Organizing & Retaliation Protections",
  },
  {
    id: "relocation_buyouts",
    uiTitle: "Buyouts, renovations, or right to return",
    uiDescription: "Relocation help and buyout rules.",
    legalTitle: "Relocation, Buyouts & Right to Return",
  },
  {
    id: "registration_compliance",
    uiTitle: "Is my landlord operating legally?",
    uiDescription: "Registration, licensing, and compliance.",
    legalTitle: "Registration, Licensing & Landlord Compliance",
  },
  {
    id: "enforcement_remedies",
    uiTitle: "How to enforce my rights",
    uiDescription: "Agencies, courts, and legal remedies.",
    legalTitle: "Enforcement & Legal Remedies",
  },
];

export const COMMON_TOPICS = TOPICS.filter((t) => t.common);

/** Map UI topic id to internal category id (tenant-rights/categories) */
export const TOPIC_ID_TO_CATEGORY_ID: Record<TopicCategoryId, string> = {
  eviction: "eviction-termination",
  repairs_withholding: "repairs-withholding",
  rent_fees: "rent-fees",
  privacy_entry: "privacy-entry",
  lease_contract: "lease-contract",
  habitability: "habitability",
  rent_control: "rent-control",
  antidiscrimination: "anti-discrimination",
  organizing_retaliation: "organizing-retaliation",
  relocation_buyouts: "relocation-buyouts",
  registration_compliance: "registration-licensing",
  enforcement_remedies: "enforcement-remedies",
};
