# RentWise — AI-Powered Property Management Platform

AI-powered legal compliance platform for property management in **Washington D.C.**, **Maryland**, and **Prince George's County**.

**To work on this project in Cursor:** Open this folder in Cursor (**File → Open Folder** → choose `rentwise 2`), then run the steps below from the integrated terminal.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in all required values (see below)

# 3. Push database schema
pnpm db:push

# 4. Seed legal knowledge base
pnpm db:seed

# 5. Start development server
pnpm dev
```

## Required Environment Variables

| Variable | Service | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk](https://clerk.com) | ✅ |
| `CLERK_SECRET_KEY` | Clerk | ✅ |
| `DATABASE_URL` | [Supabase](https://supabase.com) PostgreSQL | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ |
| `ANTHROPIC_API_KEY` | [Anthropic](https://console.anthropic.com) | ✅ |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) (fallback) | Optional |
| `RESEND_API_KEY` | [Resend](https://resend.com) | Optional |
| `STRIPE_SECRET_KEY` | [Stripe](https://stripe.com) | Phase 2 |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps | Optional |

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Auth**: Clerk (role-based: Landlord, PM, Tenant, Admin)
- **Database**: PostgreSQL via Supabase + Drizzle ORM
- **AI**: Anthropic Claude (primary) / OpenAI GPT-4o (fallback)
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI
- **State**: TanStack Query
- **Validation**: Zod
- **Background Jobs**: Inngest
- **Email**: Resend
- **Payments**: Stripe (Phase 2)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Sign in/up pages (Clerk)
│   ├── api/                      # API routes
│   │   ├── inngest/              # Inngest webhook
│   │   ├── lease/                # Lease review, generate, extract-text
│   │   ├── maintenance/          # Maintenance CRUD
│   │   ├── onboarding/           # Onboarding flow
│   │   ├── properties/           # Properties CRUD
│   │   └── webhooks/clerk/       # Clerk user sync
│   ├── dashboard/                # Authenticated dashboard
│   │   ├── inspections/          # Move-in/move-out tool
│   │   ├── lease-review/         # AI Lease Reviewer (split-pane)
│   │   ├── leases/               # Lease management + generator
│   │   ├── maintenance/          # Maintenance request system
│   │   ├── notifications/        # Notification center
│   │   ├── properties/           # Property management
│   │   ├── settings/             # Account settings
│   │   └── tenants/              # Tenant management
│   ├── lease-review/             # Public lease review (1 free)
│   ├── onboarding/               # TurboTax-style setup wizard
│   ├── pricing/                  # Pricing page
│   └── tenant-rights/            # Public Tenant Rights Portal
├── components/
│   ├── ai-disclaimer-bar.tsx     # AI disclaimers (Section 9.3)
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── client.ts             # Anthropic + OpenAI with fallback
│   │   ├── prompts.ts            # System prompts (Section 9.1)
│   │   └── services.ts           # Lease review, triage, generation
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema/index.ts       # Full database schema
│   │   └── seed.ts               # Legal knowledge base seeder
│   ├── inngest/
│   │   ├── client.ts             # Inngest client
│   │   └── functions.ts          # Scheduled notification jobs
│   ├── env.ts                    # Zod env validation
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas for all forms/APIs
└── middleware.ts                  # Clerk auth middleware
```

## Key Features (MVP — Phase 1)

### 1. Onboarding Wizard (Section 4.1)
TurboTax-style interview flow: role selection → jurisdictions → properties → units → tenants → lease upload.

### 2. AI Lease Reviewer (Section 4.3.2) ⭐ Flagship
Split-pane UI: document on left, suggestions on right. Flags:
- 🔴 **Red** — Prohibited clauses (illegal/unenforceable)
- 🟡 **Yellow** — Risky clauses (likely unenforceable)
- 🔵 **Blue** — Missing required clauses/disclosures

Each flag includes: statute citation, confidence level, suggested replacement, accept/reject actions.

### 3. Lease Template Generator (Section 4.3.1)
Generates jurisdiction-specific leases with required clauses, plain-English summaries, and customizable sections.

### 4. Maintenance Request System (Section 4.4.1)
AI-triaged maintenance with legal deadline tracking. Both parties see applicable statutes and response timelines.

### 5. Move-In/Move-Out Inspections (Section 4.7)
Room-by-room checklists with photo upload. Auto-comparison between move-in and move-out for security deposit disputes.

### 6. Tenant Rights Portal (Section 4.5)
Guided flow at `/tenant-rights`: jurisdiction picker (DC vs PG County) → category cards → jurisdiction-specific Key Rules, Deadlines, Step-by-step actions, Documents to gather, Where to file. AI chat asks follow-up questions and returns structured guidance with a non-lawyer disclaimer.

#### Adding a new jurisdiction
1. Add the jurisdiction to `Jurisdiction` in `src/lib/tenant-rights/types.ts` and to `JURISDICTION_LABELS`.
2. Create `src/lib/data/legal/<new>.ts` with legal sources (citations, URLs).
3. In `src/lib/tenant-rights/categories.ts`, add content for the new jurisdiction in each category’s `ruleCardsByJurisdiction` (e.g. `ruleCardsByJurisdiction: { dc: [...], pg: [...], new: [...] }`).
4. Update the jurisdiction picker UI in `src/components/tenant-rights/JurisdictionPicker.tsx` to include the new option and pass it through the app and to `/api/tenant-chat` context.

#### Adding or editing category content
1. Categories are defined in `src/lib/tenant-rights/categories.ts` in `TENANT_RIGHTS_CATEGORIES`. Each category has `id`, `title`, `description`, `icon`, `subtopics`, and `ruleCardsByJurisdiction`.
2. To add a new category: add an entry to the array and add its `id` to `CATEGORY_IDS` in `src/lib/tenant-rights/types.ts`.
3. To add or edit jurisdiction-specific content: fill or update `ruleCardsByJurisdiction.dc` and/or `ruleCardsByJurisdiction.pg` with `RuleCard` objects (title, legalCites, plainEnglish, deadlines, steps, evidence, contacts). Use `verify: true` on any cite or deadline that is not confirmed.
4. Optional: add `scenarioShortcuts` to the category for “Common scenarios” CTAs that open the chat with a suggested prompt.

### 7. Notification System (Section 4.6)
Inngest-powered scheduled jobs for compliance deadlines, lease expirations, and maintenance escalations.

## AI Safeguards (Section 9)

All AI features enforce:
1. **Structured JSON output** — No raw AI text for legal content
2. **Citation verification** — Every cited statute checked against legal DB
3. **Confidence levels** — High/Medium/Low on every suggestion
4. **Mandatory disclaimers** — Global footer, pre-analysis, per-suggestion
5. **Fallback handling** — Graceful failure messages if AI fails
6. **No legal advice** — Language always uses "may be", "based on [statute]"

## Legal Knowledge Base (Section 8)

Covers DC Code, DCMR, Maryland Real Property Code, PG County Code, PRSA 2024, Fair Housing Act, FCRA, and HUD Section 8. Seed with `pnpm db:seed`.

## Development Roadmap

- **Phase 1 (MVP)**: Feb–Apr 2026 — Core features above
- **Phase 2 (Growth)**: May–Aug 2026 — Tenant vetting, voucher navigator, rent collection, messaging
- **Phase 3 (Scale)**: Sep 2026+ — Virginia/NY/CA expansion, API, e-signatures, SOC 2

## Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Add webhook endpoint: `{YOUR_URL}/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy the connection string to `DATABASE_URL`
3. Enable Row Level Security on all tables
4. Run `pnpm db:push` to create tables

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

Set all environment variables in Vercel dashboard.




new change
# RentwiseFinal
