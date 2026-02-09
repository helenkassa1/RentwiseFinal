/**
 * Tenant Rights data model — jurisdiction-gated, data-driven.
 * Add new jurisdictions or categories by extending these types and data files.
 */

export type Jurisdiction = "dc" | "pg";

export const CATEGORY_IDS = [
  "habitability",
  "rent-fees",
  "lease-contract",
  "eviction-termination",
  "privacy-entry",
  "rent-control",
  "repairs-withholding",
  "anti-discrimination",
  "organizing-retaliation",
  "relocation-buyouts",
  "registration-licensing",
  "enforcement-remedies",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type SubtopicId = string;

export interface LegalCite {
  label: string;
  cite: string;
  url?: string;
  summary?: string;
  /** When true, do not show in Key rules; show under "Needs verification" */
  verify?: boolean;
}

export interface RuleCard {
  /** Optional subtopic this card belongs to */
  subtopicId?: SubtopicId;
  title: string;
  legalCites: LegalCite[];
  plainEnglish: string;
  deadlines: { label: string; detail: string; verify?: boolean }[];
  steps: string[];
  evidence: string[];
  contacts: { name: string; description?: string; url?: string; phone?: string }[];
}

export interface Subtopic {
  id: SubtopicId;
  title: string;
  shortDescription?: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string; // lucide icon name
  subtopics: Subtopic[];
  /** Content keyed by jurisdiction; use same category list for both, content differs */
  ruleCardsByJurisdiction: Partial<Record<Jurisdiction, RuleCard[]>>;
  /** Optional scenario shortcuts for "Common scenarios" CTAs */
  scenarioShortcuts?: ScenarioShortcut[];
}

export interface ScenarioShortcut {
  id: string;
  title: string;
  description: string;
  /** Optional: focus this subtopic or rule when clicked */
  subtopicId?: SubtopicId;
}

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  dc: "Washington, D.C.",
  pg: "Prince George's County, MD",
};
