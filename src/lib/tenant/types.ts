// Tenant Portal — minimal types. Wire to DB later.

export type Jurisdiction = "dc" | "pg";

export type RentInfo = {
  amount: number;
  dueDay: number; // 1–31
  gracePeriodDays?: number;
  waiverInfo?: string;
};

export type LeaseInfo = {
  startDate: string; // ISO
  endDate: string;
  rentAmount: number;
  renewalType: "month-to-month" | "fixed" | "auto-renew";
  breakClause?: string;
  lateFeeClause?: string;
  entryNoticeClause?: string;
  repairResponsibilityClause?: string;
};

export type DepositInfo = {
  amount: number;
  bankName?: string;
  accountMasked?: string;
  receivedDate?: string;
};

export type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  type: "rent" | "fee" | "deposit" | "other";
  status: "paid" | "pending" | "late" | "waived";
  note?: string;
};

export type MaintenanceRequest = {
  id: string;
  subject: string;
  description: string;
  status: "submitted" | "acknowledged" | "scheduled" | "in_progress" | "completed";
  submittedAt: string;
  updatedAt: string;
  category?: string;
  timelineNote?: string;
};

export type MessageThread = {
  id: string;
  subject: string;
  lastMessageAt: string;
  unread: number;
  isNotice?: boolean;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  date: string;
  type: "rent_due" | "lease_renewal" | "entry" | "complaint_response" | "general";
  read: boolean;
};

export type KeyTerm = {
  id: string;
  termName: string;
  whatItMeans: string;
  whyItMatters: string;
  negotiationTip?: string;
  clauseExcerpt?: string;
  /** Jurisdiction-specific rights (e.g. "DC security deposit rules") */
  relatedRights?: string;
};

export type RiskFlag = {
  label: string;
  severity: "high" | "medium" | "low";
  explanation: string;
};

export type LeaseSummary = {
  plainEnglishSummary: string[];
  keyTerms: KeyTerm[];
  riskFlags: RiskFlag[];
};

export type TenantContext = {
  tenantId: string;
  propertyId: string;
  unitLabel: string;
  propertyAddress: string;
  jurisdiction: Jurisdiction;
  rent: RentInfo;
  lease: LeaseInfo;
  deposit: DepositInfo;
  leaseSummary?: LeaseSummary;
  payments: PaymentRecord[];
  requests: MaintenanceRequest[];
  messages: MessageThread[];
  notices: Notice[];
};

/** Payload for suggestion-scoped chat (inline "Ask about this"). */
export type SuggestionChatPayload = {
  tenantContext: {
    jurisdiction: string;
    leaseSummary?: LeaseSummary;
    rentAmount?: number;
    rentDueDay?: number;
    gracePeriodDays?: number;
    depositAmount?: number;
    leaseStart?: string;
    leaseEnd?: string;
  };
  termId: string;
  termData: KeyTerm;
  userMessage: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
};

export type SuggestionChatResponse = {
  assistantMessage: string;
  followUpQuestions?: string[];
  suggestedDrafts?: { label: string; text: string }[];
  disclaimer?: string;
};

/** Payload for "Try new wording" review per suggestion. */
export type WordingReviewPayload = {
  tenantContext: SuggestionChatPayload["tenantContext"];
  termId: string;
  termData: KeyTerm;
  proposedText: string;
};

export type WordingReviewResponse = {
  clarity: "clear" | "needs_work";
  issues: string[];
  suggestedRewrite: string;
  notes: string[];
  negotiationVersion?: string;
  disclaimer?: string;
};
