// content/marketing.ts
// Single source of truth for homepage + services + tenant-portal marketing copy.
// Keep edits here so UI stays clean and consistent.

export type PillarId = "free_tools" | "tenant_portal" | "management";

export type Pillar = {
  id: PillarId;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  note: string;
  // used for soft background bands
  theme: "blue" | "green" | "purple";
  // lucide icon name (optional, if you map it)
  icon: "Scale" | "MessageSquare" | "Building2";
};

export const PILLARS: Pillar[] = [
  {
    id: "free_tools",
    eyebrow: "Free public tools",
    title: "Free Legal Tools",
    subtitle:
      "Tenant rights info, AI Q&A, and a lease assessment tool — always free. No account needed.",
    bullets: [
      "Tenant Rights Library (DC + MD/PG guidance)",
      "AI question guide in plain English (with disclaimers)",
      "Lease assessment tool (flags common issues)",
      "Step-by-step actions and checklists",
      "Links to official agencies and help resources",
      "Built for clarity, not legal jargon",
    ],
    ctaLabel: "Use Free Legal Tools",
    ctaHref: "/tenant-rights",
    note: "Always free • No signup",
    theme: "blue",
    icon: "Scale",
  },
  {
    id: "tenant_portal",
    eyebrow: "Free tenant accounts",
    title: "Tenant Portal",
    subtitle:
      "A free account for tenants connected to a landlord or property manager — for payments, requests, and communication.",
    bullets: [
      "Pay rent and view payment history",
      "Submit service requests with photos",
      "Chat with management/landlord",
      "Track complaints and updates",
      "Upload and access documents",
      "Get status updates in one place",
    ],
    ctaLabel: "Tenant Portal",
    ctaHref: "/tenant-portal",
    note: "Free for tenants • Invite-linked",
    theme: "green",
    icon: "MessageSquare",
  },
  {
    id: "management",
    eyebrow: "Paid management tools",
    title: "Management Platform",
    subtitle:
      "For landlords and property managers who want to stay compliant, reduce risk, and run operations smoothly.",
    bullets: [
      "Compliance deadlines, alerts, and audit trail",
      "Maintenance tracking + vendor finder",
      "Leasing workflow (applications → renewals)",
      "Portfolio dashboards (property managers)",
      "AI checks for risk + next-step guidance",
      "Reporting and document vault",
    ],
    ctaLabel: "Create Management Account",
    ctaHref: "/sign-up",
    note: "Paid plans • Built for pros",
    theme: "purple",
    icon: "Building2",
  },
];

export const HERO = {
  headline: "Property management, legally intelligent.",
  subheadline:
    "Free legal tools for tenants, a free tenant portal for communication, and paid management tools for landlords & property managers.",
  primaryCta: { label: "Create Management Account", href: "/sign-up" },
  secondaryCta: { label: "Use Free Legal Tools", href: "/tenant-rights" },
  tertiaryLink: { label: "Tenant Portal (Free)", href: "/tenant-portal" },
};

export const HOW_IT_WORKS = {
  title: "How it works",
  steps: [
    {
      title: "Landlord/PM creates an account",
      desc: "Add properties and set up management tools.",
      icon: "UserPlus",
    },
    {
      title: "Tenants get invited for free",
      desc: "Tenants use the portal for payments, service requests, and messaging.",
      icon: "Send",
    },
    {
      title: "RentWise keeps you on track",
      desc: "Compliance reminders, organized maintenance, and clear next steps.",
      icon: "ShieldCheck",
    },
  ],
};

export type ComparisonRow = {
  label: string;
  freeTools: string;
  tenantPortal: string;
  management: string;
};

export const MINI_COMPARISON = {
  title: "Free vs paid — at a glance",
  subtitle:
    "Free public tools + free tenant accounts. Management tools are paid for landlords and property managers.",
  columns: ["Free Legal Tools", "Tenant Portal (Free)", "Management (Paid)"],
  rows: [
    {
      label: "Tenant rights library",
      freeTools: "✅",
      tenantPortal: "—",
      management: "—",
    },
    {
      label: "AI legal Q&A (plain English)",
      freeTools: "✅",
      tenantPortal: "—",
      management: "✅",
    },
    {
      label: "Lease assessment tool",
      freeTools: "✅",
      tenantPortal: "—",
      management: "✅",
    },
    {
      label: "Rent payments",
      freeTools: "—",
      tenantPortal: "✅",
      management: "✅",
    },
    {
      label: "Service requests + status",
      freeTools: "—",
      tenantPortal: "✅",
      management: "✅",
    },
    {
      label: "Messaging / chat",
      freeTools: "—",
      tenantPortal: "✅",
      management: "✅",
    },
    {
      label: "Compliance tracking + alerts",
      freeTools: "—",
      tenantPortal: "—",
      management: "✅",
    },
    {
      label: "Maintenance management + vendors",
      freeTools: "—",
      tenantPortal: "—",
      management: "✅",
    },
    {
      label: "Client portfolios (PMs)",
      freeTools: "—",
      tenantPortal: "—",
      management: "✅",
    },
    {
      label: "Reporting",
      freeTools: "—",
      tenantPortal: "—",
      management: "✅",
    },
  ] as ComparisonRow[],
};

export const TRUST = {
  title: "Built for clarity and compliance",
  bullets: [
    "Plain-English guidance — no legal jargon",
    "Designed for DC + Maryland / PG County workflows",
    "Clear disclaimers (not legal advice)",
    "Audit trail to reduce disputes and missed deadlines",
  ],
};

export const FINAL_CTA = {
  title: "Ready to get organized?",
  subtitle:
    "Create a management account to run your rentals — or use the free legal tools anytime.",
  primaryCta: { label: "Create Management Account", href: "/sign-up" },
  secondaryCta: { label: "Explore Free Tools", href: "/tenant-rights" },
  tertiaryLink: { label: "Tenant Sign In", href: "/sign-in" },
};

export const SERVICES_PAGE = {
  title: "Services",
  subtitle:
    "Three ways to use RentWise: free legal tools, a free tenant portal, and paid management tools.",
  anchorLinks: [
    { label: "Free Legal Tools", href: "#free-legal-tools" },
    { label: "Tenant Portal", href: "#tenant-portal" },
    { label: "Management Platform", href: "#management-platform" },
    { label: "Plans", href: "#plans" },
  ],
  plansAtAGlance: [
    {
      name: "Free Legal Tools",
      price: "$0",
      note: "No signup needed",
      includes: ["Tenant rights", "AI Q&A", "Lease assessment"],
      cta: { label: "Use Free Tools", href: "/tenant-rights" },
    },
    {
      name: "Tenant Portal",
      price: "$0",
      note: "Invite-linked to your rental",
      includes: ["Payments", "Service requests", "Chat", "Docs"],
      cta: { label: "Tenant Portal", href: "/tenant-portal" },
    },
    {
      name: "Management Platform",
      price: "Paid",
      note: "For landlords & property managers",
      includes: ["Compliance", "Maintenance", "Leasing", "Portfolios (PMs)"],
      cta: { label: "Create Account", href: "/sign-up" },
    },
  ],
};

export const TENANT_PORTAL_PAGE = {
  title: "Tenant Portal",
  subtitle:
    "A free account for tenants linked to their landlord or property manager — built for payments, service requests, and communication.",
  howAccessWorks: {
    title: "How access works",
    bullets: [
      "Tenant accounts are always free.",
      "Your landlord or property manager invites you to connect to your rental.",
      "Once connected, you can pay rent, request repairs, and message in one place.",
    ],
  },
  featuresTitle: "What tenants can do",
  features: [
    "Pay rent and view payment history",
    "Submit service requests (photos + updates)",
    "Message your landlord/management",
    "Track complaints and responses",
    "Upload documents and receive notices",
  ],
  ctas: [
    { label: "Tenant Sign In", href: "/sign-in" },
    { label: "Request Invite", href: "/tenant-portal#request-invite" },
  ],
  landlordLink: {
    label: "Landlord/PM? Create a management account →",
    href: "/sign-up",
  },
};

export const FAQS = [
  {
    q: "Is this legal advice?",
    a: "No. RentWise provides general legal information in plain English, not legal advice. If you need advice for your specific situation, talk to a local attorney or legal aid.",
  },
  {
    q: "Are tenant accounts really free?",
    a: "Yes. Tenant accounts are free and are linked to a landlord or property manager account for payments, requests, and communication.",
  },
  {
    q: "Do I need an account to use the free legal tools?",
    a: "No. The Tenant Rights page, AI Q&A, and lease assessment tool are free public tools that don't require signup.",
  },
  {
    q: "Who pays for the management platform?",
    a: "Landlords and property managers pay for professional management tools like compliance tracking, maintenance workflows, and portfolio dashboards.",
  },
];
