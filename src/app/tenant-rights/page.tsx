"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, MapPin, AlertCircle, MessageCircle, ArrowRight, Scale, Sparkles, CheckCircle2, FileText, Phone } from "lucide-react";
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
import { MainNav } from "@/components/navigation/main-nav";

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

function shortLabelForJurisdiction(j: Jurisdiction) {
  return j === "dc" ? "Washington, D.C." : "PG County, MD";
}

function lawLabelForJurisdiction(j: Jurisdiction) {
  return j === "dc" ? "Washington, D.C. law" : "Maryland / PG County law";
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

/* Extra display data for common topic cards */
const TOPIC_CARD_META: Record<string, { description: string; citation?: string; urgencyColor?: "red" | "amber" }> = {
  eviction: { description: "Court process, required notices, and how to respond to protect yourself", citation: "DC Code § 42-3505.01", urgencyColor: "red" },
  repairs_withholding: { description: "How to request repairs, document issues, and use rent escrow", citation: "14 DCMR § 501", urgencyColor: "red" },
  habitability: { description: "Mold, no heat, pests, lead paint — your right to a safe home", citation: "DC Code § 42-3405", urgencyColor: "red" },
  rent_fees: { description: "What your landlord can charge, legal limits, and proper notice requirements", citation: "DC Code § 42-3502.08" },
  privacy_entry: { description: "Required notice rules, harassment protections, and what to do" },
  lease_contract: { description: "Illegal clauses, early termination, renewals, and lease changes", citation: "14 DCMR § 304" },
};

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
        detailsRef.current?.focus({ preventScroll: false });
      }
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

  // ——— STEP 1: Jurisdiction gate (fullscreen feel) ———
  if (!jurisdiction) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Where do you live?</h1>
            <p className="text-muted-foreground">
              Your rights depend on your location. Pick one to continue.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handlePickJurisdiction("dc")}
              className="rounded-2xl border-2 border-border p-6 text-left transition hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Select Washington, D.C."
            >
              <div className="text-base font-semibold">Washington, D.C.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Get DC-specific rules, steps, and agencies
              </div>
            </button>
            <button
              type="button"
              onClick={() => handlePickJurisdiction("pg")}
              className="rounded-2xl border-2 border-border p-6 text-left transition hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Select Prince George's County, MD"
            >
              <div className="text-base font-semibold">Prince George&apos;s County, MD</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Get Maryland/PG-specific rules and resources
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ——— STEP 2: Main page ———
  return (
    <div className="min-h-screen bg-slate-50">
      <MainNav />

      {/* Dark branded header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Know your rights as a renter.
              </h1>
              <p className="text-blue-200 mt-2 text-sm max-w-md">
                Free legal guidance grounded in {jurisdiction === "dc" ? "DC" : "Maryland"} housing codes — not generic advice.
              </p>
            </div>

            {/* Jurisdiction selector — PRESERVES existing Change handler and state */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 backdrop-blur-sm flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-300" />
              <div>
                <span className="text-sm font-semibold text-white">{shortLabelForJurisdiction(jurisdiction)}</span>
                <button
                  type="button"
                  onClick={handleChangeJurisdiction}
                  className="text-xs text-blue-300 hover:text-white ml-2 underline underline-offset-2 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-blue-300/50 mt-3">
            Answers based on {jurisdiction === "dc" ? "DC" : "Maryland"} housing law · Not legal advice · Always free
          </p>
        </div>
      </div>

      {/* Value strip — what you'll get */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Step-by-step guidance for your situation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Relevant laws and statutes cited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Template letters and next actions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm text-slate-700 font-medium">Agencies and resources to contact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* LEFT — Topics (3 cols) */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <h2 className="text-lg font-bold text-slate-900">Common problems</h2>
          <p className="text-sm text-slate-500 mt-1">Pick your situation for step-by-step guidance specific to {shortLabelForJurisdiction(jurisdiction)}.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {commonTopics.map((topic) => {
              const meta = TOPIC_CARD_META[topic.id];
              const isUrgent = topic.urgency === "urgent";
              const urgencyColor = meta?.urgencyColor;
              const borderClass = urgencyColor === "red"
                ? "border-red-200 border-l-[3px] border-l-red-400 hover:border-red-300"
                : urgencyColor === "amber"
                  ? "border-amber-200 border-l-[3px] border-l-amber-400 hover:border-amber-300"
                  : "border-slate-200 hover:border-slate-300";
              const arrowHover = urgencyColor === "red"
                ? "group-hover:text-red-500"
                : urgencyColor === "amber"
                  ? "group-hover:text-amber-500"
                  : "group-hover:text-slate-500";
              const badgeBg = urgencyColor === "red"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-amber-50 text-amber-600 border-amber-200";

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className={cx(
                    "bg-white border rounded-xl p-4 text-left cursor-pointer hover:shadow-md transition-all group",
                    borderClass
                  )}
                  aria-label={`Open topic: ${topic.uiTitle}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{topic.uiTitle}</h3>
                    <ArrowRight className={cx("w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-all", arrowHover)} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{meta?.description ?? topic.uiDescription}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    {isUrgent && (
                      <span className={cx("text-[9px] font-bold px-2 py-0.5 rounded-full border", badgeBg)}>URGENT</span>
                    )}
                    {meta?.citation && (
                      <span className="text-[9px] text-slate-400">{meta.citation}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* See all topics — PRESERVES toggle handler */}
          <button
            type="button"
            onClick={() => setShowAllTopics((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-[#2563eb] hover:text-blue-700 font-semibold mt-5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            aria-expanded={showAllTopics}
          >
            {showAllTopics ? "Hide all topics" : "See all topics"} <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {showAllTopics && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allTopics.map((topic) => {
                const meta = TOPIC_CARD_META[topic.id];
                const isUrgent = topic.urgency === "urgent";
                const urgencyColor = meta?.urgencyColor;
                const borderClass = urgencyColor === "red"
                  ? "border-red-200 border-l-[3px] border-l-red-400 hover:border-red-300"
                  : urgencyColor === "amber"
                    ? "border-amber-200 border-l-[3px] border-l-amber-400 hover:border-amber-300"
                    : "border-slate-200 hover:border-slate-300";
                const arrowHover = urgencyColor === "red"
                  ? "group-hover:text-red-500"
                  : urgencyColor === "amber"
                    ? "group-hover:text-amber-500"
                    : "group-hover:text-slate-500";
                const badgeBg = urgencyColor === "red"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-amber-50 text-amber-600 border-amber-200";

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleSelectTopic(topic.id)}
                    className={cx(
                      "bg-white border rounded-xl p-4 text-left cursor-pointer hover:shadow-md transition-all group",
                      borderClass
                    )}
                    aria-label={`Open topic: ${topic.uiTitle}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{topic.uiTitle}</h3>
                      <ArrowRight className={cx("w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-all", arrowHover)} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{meta?.description ?? topic.uiDescription}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      {isUrgent && (
                        <span className={cx("text-[9px] font-bold px-2 py-0.5 rounded-full border", badgeBg)}>URGENT</span>
                      )}
                      {meta?.citation && (
                        <span className="text-[9px] text-slate-400">{meta.citation}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Chat (2 cols, sticky) */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">

            {/* Chat card */}
            <section
              ref={helpSectionRef}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              aria-labelledby="help-heading"
              id="chat-container"
            >
              {/* Chat header */}
              <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div id="help-heading" className="text-sm font-bold text-slate-800">Rights Assistant</div>
                  <div className="text-[10px] text-slate-500">AI-powered · {lawLabelForJurisdiction(jurisdiction)}</div>
                </div>
                <span className="ml-auto text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">FREE</span>
              </div>

              {/* Disclaimer — compact */}
              <div className="flex items-start gap-2 px-4 py-2 bg-amber-50/50 border-b border-amber-100/50">
                <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  Not legal advice. For your specific situation, consult a local tenant attorney or legal aid.
                </p>
              </div>

              {/* Response area — PRESERVES existing AI response rendering */}
              <div
                ref={chatScrollRef}
                className="h-[300px] overflow-y-auto px-5 py-4 space-y-4"
              >
                {chatMessages.length === 0 && !chatLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Scale className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mt-3">Ask about your situation</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                      Describe what&apos;s happening. I&apos;ll give you your rights, next steps, and the specific law that applies.
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
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        msg.role === "user"
                          ? "rounded-br-md bg-[#1e3a5f] text-white"
                          : "rounded-bl-md bg-slate-50 border border-slate-200"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <span className="block text-xs font-medium text-slate-400 mb-1.5">Rights Assistant</span>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-400">
                      Thinking…
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt chips — PRESERVES all handlers */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="text-[11px] text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      onClick={() => setQuestion((prev) => (prev ? prev + " " + chip : chip))}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input area — PRESERVES existing textarea and submit handler */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={chatMessages.length > 0 ? "Type a follow-up…" : "Describe your problem. Include dates and what you want to happen."}
                    className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[44px] max-h-[100px]"
                    aria-label="Your message"
                    disabled={chatLoading}
                    rows={chatMessages.length > 0 ? 1 : 2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        startChat();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={startChat}
                    disabled={!question.trim() || chatLoading}
                    className="self-end bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {chatMessages.length === 0 ? "Get Help" : "Send"}
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Topic details — full width below the grid */}
      {selectedTopic && category && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <div
            ref={detailsRef}
            tabIndex={-1}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Topic details"
          >
            <CategoryDetail
              category={category}
              jurisdiction={jurisdiction}
              onOpenChat={(prompt) => {
                if (prompt) setQuestion(prompt);
                helpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              scrollRef={undefined}
            />
          </div>
        </section>
      )}

      {/* Footer disclaimer */}
      <div className="border-t border-slate-100 py-6 px-6">
        <p className="text-[11px] text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
          RentWise provides AI-powered legal information for educational purposes only. Not legal advice. Not an attorney-client relationship. Based on DC and Maryland housing codes as of February 2026. Consult a licensed attorney for specific situations.
        </p>
      </div>
    </div>
  );
}

export default function TenantRightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}>
      <TenantRightsContent />
    </Suspense>
  );
}
