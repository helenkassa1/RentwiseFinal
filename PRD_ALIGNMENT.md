# PRD Alignment: AI-Powered Property Management Platform

This document maps the **Product Requirements Document (AI-Powered Property Management Platform)** to the Rentwise codebase and evaluation criteria.

---

## Core Functional Requirements (MVP)

| # | Requirement | Status | Location / Notes |
|---|-------------|--------|-------------------|
| 1 | **AI Tenant Vetting** — applicant scoring, credit/background/income, voucher eligibility (DC/PG County) | Partial | DB: `tenant_applications`, `screening_results`, `income_verification`. No AI scoring UI or API yet. |
| 2 | **Voucher Tenant Navigator** — DCHA & HAPGC workflows, HQS standards | Placeholder | `/voucher-navigation` — CTA only. Guided workflow and HQS content not built. |
| 3 | **Lease Template Generator** — jurisdiction-specific, voucher vs private, DC/MD/PG clauses | Backend ready | `lib/ai/prompts.ts` (`getLeaseGeneratorPrompt`), `lib/ai/services.ts` (`generateLease`). No UI or API route yet. |
| 4 | **Lease Agreement Reviewer** — AI analysis, prohibited/risky/missing clauses, citations, suggested revisions | Done | `/lease-review`, `/api/lease/review`, `/api/lease/extract-text`. PDF/Word upload, DC/MD/PG, disclaimers, export revised lease. |
| 5 | **Maintenance Workflow with Legal Timelines** — DC 24h emergency, 3–7 day serious | Backend ready | `getMaintenanceTriagePrompt`, `triageMaintenance()` in services. No dedicated maintenance UI or API yet. |
| 6 | **Repair Suggestion Engine** — Thumbtack, TaskRabbit, Google Local Services | Partial | `VendorFinder`, `/api/vendors/search`. Google Places integrated; Thumbtack/TaskRabbit adapters are stubs until APIs configured. |
| 7 | **Tenant Rights & Landlord Duties Portal** — notice, documentation, escalation, DC/MD codes | Done | `/tenant-rights`, `/rights-assistant`. Jurisdiction (DC/PG), categories, AI chat, citations. |

---

## Evaluation Criteria

- **Technical sophistication**  
  Lease reviewer: multi-step prompt (identify clauses → cross-reference statutes → flag → suggest alternatives), structured JSON, citation verification against `legal_statutes` DB.  
  Maintenance triage and lease generator prompts are structured; voucher navigator and tenant vetting AI not yet implemented.

- **Efficiency gains**  
  Lease review automates extraction + AI review + export. Template generator and maintenance triage will reduce manual effort once UI/API are added.

- **Ease of use**  
  Lease review: upload or paste, jurisdiction select, clear severity (Prohibited/Risky/Missing), accept/reject/flag, export. Tenant rights: topic grid, jurisdiction picker, plain-language summaries.

- **Usability of output**  
  Lease review: itemized issues, citation, explanation, suggested replacement, export revised text + changelog. Tenant rights: structured rights with statute and escalation path.

- **Relevance and problem identification**  
  Focus on DC and Prince George’s County; prohibited clauses (e.g. jury waiver, self-help eviction) and HQS/voucher context called out in prompts and content.

- **Ethical safeguards**  
  - **UPL:** Global and pre-analysis disclaimers (`ai-disclaimer-bar.tsx`, prompts), “consult a licensed attorney” in footer and per-suggestion when confidence is low.  
  - **Citation verification:** `verifyCitations()` checks AI citations against `legal_statutes`; unverified citations get a warning in the explanation.  
  - **Human-in-the-loop:** Accept/Reject/Flag for attorney on each suggestion; export for human review.

- **Creativity and ambition**  
  Hyper-local legal prompts (DC, Maryland, PG County), citation verification, and lease export with changelog support preventative compliance.

---

## Technical Stack vs PRD

| Component | PRD | Current |
|-----------|-----|--------|
| Framework | Next.js 14+ App Router | Next.js 15, App Router |
| Language | TypeScript | TypeScript |
| Auth | NextAuth / Clerk | Clerk |
| Database | PostgreSQL (Supabase/TiDB), Drizzle/Prisma | PostgreSQL, Drizzle |
| AI | OpenAI GPT-4o | Anthropic primary, OpenAI fallback (`lib/ai/client.ts`) |
| Styling | Tailwind + Shadcn/Radix | Tailwind + Radix |
| State | TanStack Query | TanStack Query |
| API | Next.js Route Handlers | Next.js Route Handlers |
| Integrations | Thumbtack, TaskRabbit, Google, Stripe | Stripe, Resend, Inngest; vendor libs (Google wired; Thumbtack/TaskRabbit stubbed) |

---

## Suggested Next Steps (Priority)

1. **Lease Template Generator** — Add `/api/lease/generate` and a form (jurisdiction, voucher/private, party/address/rent/dates) → call `generateLease()` and render/edit clauses.
2. **Maintenance workflow** — Add maintenance request UI and `/api/maintenance/triage` that calls `triageMaintenance()` and shows legal deadline + licensed-professional flag.
3. **Voucher Navigator** — Replace placeholder with step-by-step DCHA/HAPGC flows and HQS checklist.
4. **AI Tenant Vetting** — Use `tenant_applications` and add AI scoring service + UI for applicant evaluation and voucher eligibility.
5. **Vendor APIs** — Configure Thumbtack/TaskRabbit (or official partners) and wire into `VendorFinder` so repair suggestions are populated.

---

## Files Touched for This Alignment

- **Schema:** `src/lib/db/schema/index.ts` — Drizzle tables + `LeaseReviewResult` type (previously missing).
- **APIs:**  
  - `src/app/api/lease/extract-text/route.ts` — PDF/Word text extraction.  
  - `src/app/api/lease/review/route.ts` — Lease review handler.  
  - `src/app/api/vendors/search/route.ts` — Vendor search for repair suggestions.

Existing features (lease review page, AI prompts, tenant rights, VendorFinder, Inngest, license verification stub) were left as-is; this doc and the new schema/APIs align the app with the PRD and evaluation criteria above.
