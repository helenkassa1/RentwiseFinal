"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback, ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  MapPin,
  AlertCircle,
  Send,
  MessageCircle,
  Scale,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  COMMON_TOPICS,
  TOPICS,
  TOPIC_ID_TO_CATEGORY_ID,
  type Jurisdiction,
  type Topic,
  type TopicCategoryId,
} from "@/data/tenantTopics";
import { getCategory } from "@/lib/tenant-rights/categories";
import type { Category } from "@/lib/tenant-rights/types";
import { CategoryDetail } from "@/components/tenant-rights/CategoryDetail";
import { trackTenantRights } from "@/lib/tenant-rights/analytics";

const STORAGE_KEY = "tenant_rights_jurisdiction";
const QUERY_KEY = "jurisdiction";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getQueryJurisdiction(): Jurisdiction | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const j = params.get(QUERY_KEY);
  return j === "dc" || j === "pg" ? j : null;
}

function setQueryJurisdiction(j: Jurisdiction) {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_KEY, j);
  window.history.replaceState({}, "", url.pathname + url.search);
}

function saveJurisdiction(j: Jurisdiction) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, j);
    setQueryJurisdiction(j);
  }
}

function loadJurisdiction(): Jurisdiction | null {
  const fromQuery = getQueryJurisdiction();
  if (fromQuery) return fromQuery;
  if (typeof window === "undefined") return null;
  const ls = localStorage.getItem(STORAGE_KEY);
  return ls === "dc" || ls === "pg" ? ls : null;
}

function labelForJurisdiction(j: Jurisdiction) {
  return j === "dc" ? "Washington, D.C." : "Prince George's County, MD";
}

/* ── Topic card descriptions & statute citations (jurisdiction-aware) ── */
const TOPIC_META: Record<TopicCategoryId, { desc: string; dcStatute?: string; pgStatute?: string }> = {
  eviction: {
    desc: "Know the exact steps your landlord must follow before you can be removed.",
    dcStatute: "DC Code § 42-3505.01",
    pgStatute: "MD Real Prop. § 8-401",
  },
  repairs_withholding: {
    desc: "Document issues, request repairs in writing, and learn when you can withhold rent.",
    dcStatute: "DC Code § 42-3405.07",
    pgStatute: "MD Real Prop. § 8-211",
  },
  rent_fees: {
    desc: "Understand what your landlord can legally charge and when increases are allowed.",
    dcStatute: "DC Code § 42-3502",
    pgStatute: "PG County Code § 13-176",
  },
  privacy_entry: {
    desc: "Your landlord must give proper notice before entering — learn the rules.",
  },
  lease_contract: {
    desc: "Review lease terms, renewals, and what clauses may be unenforceable.",
  },
  habitability: {
    desc: "Mold, pests, no heat or hot water — your right to a safe, livable home.",
    dcStatute: "DC Code § 42-3251",
    pgStatute: "MD Real Prop. § 8-211",
  },
  rent_control: {
    desc: "Find out if your unit is covered by rent stabilization rules.",
    dcStatute: "DC Rental Housing Act",
    pgStatute: "PG County Code § 13-173",
  },
  antidiscrimination: {
    desc: "Protected classes, source-of-income rights, and how to file a complaint.",
    dcStatute: "DC Human Rights Act",
    pgStatute: "MD State Gov. § 20-601",
  },
  organizing_retaliation: {
    desc: "Your landlord cannot punish you for reporting problems or organizing tenants.",
    dcStatute: "DC Code § 42-3505.02",
    pgStatute: "MD Real Prop. § 8-208.1",
  },
  relocation_buyouts: {
    desc: "Know your rights if asked to leave for renovations or offered a buyout.",
  },
  registration_compliance: {
    desc: "Check whether your landlord has the required licenses and registrations.",
    dcStatute: "DC Code § 42-3502.05",
    pgStatute: "PG County Code § 13-172",
  },
  enforcement_remedies: {
    desc: "Agencies to contact, how to file complaints, and when to go to court.",
  },
};

/** Lightweight markdown → JSX: handles **bold**, numbered lists, bullet lists, and paragraphs */
function renderMarkdown(text: string): ReactNode {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // blank line → spacer
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // numbered list item: "1. ", "2. ", etc.
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-1 mb-0.5">
          <span className="font-semibold text-slate-500 shrink-0">{numMatch[1]}.</span>
          <span>{inlineMd(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // bullet list item: "- " or "• "
    const bulletMatch = line.match(/^[-•]\s+(.*)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-1 mb-0.5">
          <span className="text-slate-400 shrink-0">•</span>
          <span>{inlineMd(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // regular paragraph line
    elements.push(<p key={key++} className="mb-1">{inlineMd(line)}</p>);
  }

  return <>{elements}</>;
}

/** Inline markdown: **bold** */
function inlineMd(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) return <strong key={i} className="font-semibold">{boldMatch[1]}</strong>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function TopicCard({
  topic,
  onClick,
  jurisdiction,
}: {
  topic: Topic;
  onClick: (id: TopicCategoryId) => void;
  jurisdiction: Jurisdiction;
}) {
  const urgent = topic.urgency === "urgent";
  const meta = TOPIC_META[topic.id];
  const statute = jurisdiction === "dc" ? meta?.dcStatute : meta?.pgStatute;
  return (
    <button
      type="button"
      onClick={() => onClick(topic.id)}
      className={cx(
        "group w-full rounded-xl border bg-white p-4 text-left transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2",
        urgent && "border-l-[3px] border-l-red-400 border-slate-200",
        !urgent && "border-slate-200 hover:border-[#1e3a5f]/30"
      )}
      aria-label={`Open topic: ${topic.uiTitle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{topic.uiTitle}</h3>
            {urgent && (
              <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Urgent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{meta?.desc || topic.uiDescription}</p>
          {statute && (
            <p className="text-[10px] text-slate-400 font-medium">{statute}</p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 mt-1 shrink-0 transition group-hover:text-[#1e3a5f] group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

const QUICK_PROMPTS = [
  "My landlord won't make repairs",
  "I got an eviction notice",
  "My deposit wasn't returned",
  "Landlord entered without notice",
  "My rent increased",
];

const DISCLAIMER =
  "I'm not a lawyer and this isn't legal advice. For advice on your specific situation, talk to a local tenant attorney or legal aid.";

function TenantRightsContent() {
  const searchParams = useSearchParams();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<TopicCategoryId | null>(null);

  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const detailsRef = useRef<HTMLDivElement | null>(null);
  const helpSectionRef = useRef<HTMLElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    const j = loadJurisdiction();
    if (j) setJurisdiction(j);
  }, []);

  useEffect(() => {
    const q = searchParams.get(QUERY_KEY);
    if (q === "dc" || q === "pg") setJurisdiction(q);
  }, [searchParams]);

  const commonTopics = useMemo(() => COMMON_TOPICS, []);
  const allTopics = useMemo(() => TOPICS, []);

  const selectedTopic = useMemo(
    () => allTopics.find((t) => t.id === selectedTopicId) ?? null,
    [allTopics, selectedTopicId]
  );

  const internalCategoryId = selectedTopicId ? TOPIC_ID_TO_CATEGORY_ID[selectedTopicId] : null;
  const category = internalCategoryId ? getCategory(internalCategoryId) : null;

  const handlePickJurisdiction = useCallback((j: Jurisdiction) => {
    setJurisdiction(j);
    saveJurisdiction(j);
    setSelectedTopicId(null);
    setShowAllTopics(false);
    setChatMessages([]);
    setQuestion("");
    trackTenantRights({ name: "jurisdiction_selected", jurisdiction: j });
  }, []);

  const handleChangeJurisdiction = useCallback(() => {
    setJurisdiction(null);
    setSelectedTopicId(null);
    setShowAllTopics(false);
    setChatMessages([]);
    setQuestion("");
    const url = new URL(window.location.href);
    url.searchParams.delete(QUERY_KEY);
    window.history.replaceState({}, "", url.pathname + url.search);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleSelectTopic = useCallback((id: TopicCategoryId) => {
    setSelectedTopicId(id);
    trackTenantRights({ name: "category_selected", categoryId: id });
    setTimeout(() => {
      // On mobile, scroll to chat; on desktop, scroll to details
      if (window.innerWidth < 1024) {
        document.getElementById("chat-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      detailsRef.current?.focus({ preventScroll: false });
    }, 50);
  }, []);

  const startChat = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed || !jurisdiction || chatLoading) return;
    const userMsg = { role: "user" as const, content: trimmed };
    setChatMessages((m) => [...m, userMsg]);
    setQuestion("");
    setChatLoading(true);
    trackTenantRights({ name: "chat_started", jurisdiction, categoryId: selectedTopicId ?? undefined });
    try {
      const res = await fetch("/api/tenant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          jurisdiction,
          selectedCategory: selectedTopic?.legalTitle,
          kbSnippets: undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const serverMessage = typeof data.error === "string" ? data.error : "Request failed";
        setChatMessages((m) => [...m, { role: "assistant", content: `${serverMessage} ${DISCLAIMER}` }]);
        return;
      }
      setChatMessages((m) => [...m, { role: "assistant", content: data.content ?? "I couldn't generate a response. Please try again." }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setChatMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, I couldn't get a response. ${message} ${DISCLAIMER}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [question, jurisdiction, chatLoading, chatMessages, selectedTopic?.legalTitle, selectedTopicId]);

  // ——— STEP 1: Jurisdiction gate ———
  if (!jurisdiction) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navy header */}
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d4a6f] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-medium backdrop-blur-sm">
              <Scale className="w-3.5 h-3.5 text-blue-300" />
              AI-Powered Rights Guide
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-5" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Know Your Tenant Rights
            </h1>
            <p className="text-blue-200 text-base mt-3 max-w-xl mx-auto leading-relaxed">
              Get step-by-step guidance for your rental situation. Choose your location to see the laws that protect you.
            </p>
          </div>
        </div>

        {/* Jurisdiction cards */}
        <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handlePickJurisdiction("dc")}
              className="bg-white rounded-xl border border-slate-200 p-6 text-left transition-all hover:border-[#1e3a5f]/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2 group"
              aria-label="Select Washington, D.C."
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 ml-auto transition group-hover:text-[#1e3a5f] group-hover:translate-x-0.5" />
              </div>
              <div className="text-base font-bold text-slate-900">Washington, D.C.</div>
              <div className="mt-1 text-sm text-slate-500">DC-specific tenant protections, rent control, and agencies</div>
            </button>
            <button
              type="button"
              onClick={() => handlePickJurisdiction("pg")}
              className="bg-white rounded-xl border border-slate-200 p-6 text-left transition-all hover:border-[#1e3a5f]/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2 group"
              aria-label="Select Prince George's County, MD"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 ml-auto transition group-hover:text-[#1e3a5f] group-hover:translate-x-0.5" />
              </div>
              <div className="text-base font-bold text-slate-900">Prince George&apos;s County, MD</div>
              <div className="mt-1 text-sm text-slate-500">Maryland &amp; PG County tenant rules and resources</div>
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-12 mb-12 text-xs text-slate-400 px-6">
          {["Free for all tenants", "AI guidance, not legal advice", "Your data stays private"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ——— STEP 2: Main page ———
  const topicsToShow = showAllTopics ? allTopics : commonTopics;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ NAVY GRADIENT HEADER ═══ */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d4a6f] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90">
                  <Shield className="h-5 w-5 text-blue-300" aria-hidden />
                  <span className="text-sm font-semibold text-white/80">RentWise</span>
                </Link>
                <span className="text-white/30">|</span>
                <span className="text-sm text-white/60">Tenant Rights</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Get Help With Your Rental Problem
              </h1>
              <p className="text-blue-200 text-sm mt-1.5 max-w-lg">
                Choose a topic or describe your situation for step-by-step guidance.
              </p>
            </div>

            {/* Jurisdiction pill */}
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-sm backdrop-blur-sm self-start">
              <MapPin className="h-4 w-4 shrink-0 text-blue-300" aria-hidden />
              <span className="text-white font-medium">{labelForJurisdiction(jurisdiction)}</span>
              <button
                type="button"
                onClick={handleChangeJurisdiction}
                className="text-blue-300 hover:text-white text-xs font-medium underline underline-offset-2 hover:no-underline transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN TWO-COLUMN LAYOUT ═══ */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT COLUMN: Topics (3/5) ── */}
          <div className="w-full lg:w-3/5">
            {/* Topic details (shown when a topic is selected) */}
            {selectedTopic && category && (
              <div
                ref={detailsRef}
                tabIndex={-1}
                className="bg-white rounded-xl border border-slate-200 p-6 mb-6 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2"
                aria-label="Topic details"
              >
                <CategoryDetail
                  category={category}
                  jurisdiction={jurisdiction}
                  onOpenChat={(prompt) => {
                    if (prompt) setQuestion(prompt);
                    document.getElementById("chat-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  scrollRef={undefined}
                />
              </div>
            )}

            {/* Topic heading */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {showAllTopics ? "All Topics" : "Common Problems"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick what matches your situation for steps specific to {jurisdiction === "dc" ? "D.C." : "PG County"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllTopics((v) => !v)}
                className="text-xs text-[#2563eb] font-semibold hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2 rounded"
                aria-expanded={showAllTopics}
              >
                {showAllTopics ? "Show common" : "See all topics"}
              </button>
            </div>

            {/* Topic cards grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {topicsToShow.map((t) => (
                <TopicCard key={t.id} topic={t} onClick={handleSelectTopic} jurisdiction={jurisdiction} />
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Chat (2/5) ── */}
          <div className="w-full lg:w-2/5" id="chat-container">
            <div className="lg:sticky lg:top-6">
              <section
                ref={helpSectionRef}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm"
                aria-labelledby="help-heading"
              >
                {/* Chat header */}
                <div className="bg-[#1e3a5f] px-5 py-4">
                  <h2 id="help-heading" className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-300" aria-hidden />
                    Rights Assistant
                  </h2>
                  <p className="mt-0.5 text-xs text-blue-200/80">
                    Describe your situation for step-by-step guidance
                  </p>
                </div>

                {/* Disclaimer bar */}
                <div className="px-4 py-2 flex items-start gap-2 border-b border-slate-100 bg-amber-50/60">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" aria-hidden />
                  <p className="text-[10px] text-amber-700/80 leading-relaxed">{DISCLAIMER}</p>
                </div>

                {/* Messages area */}
                <div
                  ref={chatScrollRef}
                  className="flex flex-col min-h-[240px] max-h-[400px] overflow-y-auto p-4 space-y-4"
                >
                  {chatMessages.length === 0 && !chatLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <MessageCircle className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Ask about your rights</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                        Describe your problem or pick a prompt below to get started.
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={cx(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cx(
                          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                          msg.role === "user"
                            ? "rounded-br-md bg-[#1e3a5f] text-white"
                            : "rounded-bl-md bg-slate-100 border border-slate-200 text-slate-800"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <span className="block text-[10px] font-semibold text-slate-500 mb-1">Rights Assistant</span>
                        )}
                        <div className="whitespace-pre-wrap">
                          {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm text-slate-500">
                        <span className="inline-flex gap-1">
                          <span className="animate-pulse">Thinking</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick prompt chips */}
                <div className="px-4 pt-2.5 pb-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                  {QUICK_PROMPTS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 font-medium transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1"
                      onClick={() => setQuestion((prev) => (prev ? prev + " " + chip : chip))}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          startChat();
                        }
                      }}
                      placeholder={chatMessages.length > 0 ? "Type a follow-up..." : "Describe your problem..."}
                      className="min-h-[44px] max-h-32 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]/30 disabled:opacity-50 resize-none transition"
                      aria-label="Your message"
                      disabled={chatLoading}
                      rows={chatMessages.length > 0 ? 1 : 2}
                    />
                    <button
                      type="button"
                      onClick={startChat}
                      disabled={!question.trim() || chatLoading}
                      className="shrink-0 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-white hover:bg-[#162d4a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2 h-[44px] transition-colors"
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" aria-hidden />
                      <span className="text-sm font-medium">{chatMessages.length === 0 ? "Get Help" : "Send"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* "What you'll get" info box */}
              <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1e3a5f]" />
                  What you&apos;ll get
                </h3>
                <div className="space-y-2">
                  {[
                    "Step-by-step guidance for your specific situation",
                    "Relevant laws and statutes for your jurisdiction",
                    "Template letters and next actions",
                    "Agencies and resources to contact",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-500">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-400">
          This information is for educational purposes only and does not constitute legal advice. Verify with a licensed attorney or legal aid.
        </div>
      </footer>
    </div>
  );
}

export default function TenantRightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <TenantRightsContent />
    </Suspense>
  );
}
