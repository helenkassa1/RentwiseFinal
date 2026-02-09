import { callAI, parseAIJSON, verifyCitations } from "./client";
import { getLeaseReviewPrompt, getMaintenanceTriagePrompt, getLeaseGeneratorPrompt } from "./prompts";
import type { LeaseReviewResult } from "@/lib/db/schema";

// ============================================
// Lease Review Service
// ============================================

type LeaseReviewAIResponse = {
  issues: Array<{
    id: string;
    issueType: "prohibited" | "risky" | "missing";
    severity: "red" | "yellow" | "blue";
    title: string;
    summary: string;
    problematicText: string | null;
    explanation: string;
    citedStatute: string;
    suggestedAction: string;
    suggestedReplacement: string | null;
    confidenceLevel: "high" | "medium" | "low";
  }>;
  summary: {
    totalIssues: number;
    redFlags: number;
    yellowFlags: number;
    blueFlags: number;
    overallAssessment: string;
  };
};

export async function reviewLease(
  leaseText: string,
  jurisdiction: string
): Promise<{
  results: LeaseReviewResult[];
  summary: LeaseReviewAIResponse["summary"];
  unverifiedCitations: string[];
}> {
  const systemPrompt = getLeaseReviewPrompt(jurisdiction);

  const response = await callAI(systemPrompt, `Please review the following lease agreement:\n\n${leaseText}`, {
    maxTokens: 8192,
  });

  const parsed = parseAIJSON<LeaseReviewAIResponse>(response.content);

  // Verify citations (Section 9.2 - Hallucination Prevention)
  const allCitations = parsed.issues.map((i) => i.citedStatute);
  const { unverified } = await verifyCitations(allCitations, jurisdiction);

  // Map to LeaseReviewResult format with status tracking
  const results: LeaseReviewResult[] = parsed.issues.map((issue) => ({
    ...issue,
    problematicText: issue.problematicText ?? undefined,
    suggestedReplacement: issue.suggestedReplacement ?? undefined,
    status: "pending" as const,
    // Mark unverified citations
    ...(unverified.includes(issue.citedStatute)
      ? {
          explanation:
            issue.explanation +
            "\n\n⚠️ This suggestion could not be verified against our legal database. Please consult an attorney.",
        }
      : {}),
  }));

  return {
    results,
    summary: parsed.summary,
    unverifiedCitations: unverified,
  };
}

// ============================================
// Maintenance Triage Service
// ============================================

type MaintenanceTriageResult = {
  suggestedPriority: "emergency" | "urgent" | "routine";
  legalDeadline: string;
  statute: string;
  explanation: string;
  requiresLicensedProfessional: boolean;
  professionalType?: string;
  tenantNextSteps: string;
  confidenceLevel: "high" | "medium" | "low";
};

export async function triageMaintenance(
  description: string,
  category: string,
  jurisdiction: string
): Promise<MaintenanceTriageResult> {
  const systemPrompt = getMaintenanceTriagePrompt(jurisdiction);

  const response = await callAI(
    systemPrompt,
    `Maintenance Request:\nCategory: ${category}\nDescription: ${description}`,
    { maxTokens: 2048 }
  );

  return parseAIJSON<MaintenanceTriageResult>(response.content);
}

// ============================================
// Lease Generator Service
// ============================================

type GeneratedLease = {
  clauses: Array<{
    id: string;
    section: string;
    legalText: string;
    plainEnglish: string;
    isRequired: boolean;
    isCustomizable: boolean;
    citedStatute: string | null;
    customizableFields: string[];
  }>;
  requiredDisclosures: Array<{
    name: string;
    text: string;
    statute: string;
  }>;
};

export async function generateLease(
  jurisdiction: string,
  isVoucher: boolean,
  templateData: {
    landlordName: string;
    tenantName: string;
    propertyAddress: string;
    unitIdentifier: string;
    rentAmount: string;
    securityDeposit: string;
    leaseStartDate: string;
    leaseEndDate: string;
    leaseTerm: string;
  }
): Promise<GeneratedLease> {
  const systemPrompt = getLeaseGeneratorPrompt(jurisdiction, isVoucher);

  const response = await callAI(
    systemPrompt,
    `Generate a lease agreement with the following details:
Landlord: ${templateData.landlordName}
Tenant: ${templateData.tenantName}
Property: ${templateData.propertyAddress}, ${templateData.unitIdentifier}
Monthly Rent: $${templateData.rentAmount}
Security Deposit: $${templateData.securityDeposit}
Lease Start: ${templateData.leaseStartDate}
Lease End: ${templateData.leaseEndDate}
Term: ${templateData.leaseTerm}
Voucher Tenant: ${isVoucher ? "Yes" : "No"}`,
    { maxTokens: 8192 }
  );

  return parseAIJSON<GeneratedLease>(response.content);
}
