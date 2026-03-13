"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, MapPin, AlertCircle, Send, MessageCircle } from "lucide-react";
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

function UrgentBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full border border-amber-500/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
      aria-label="Urgent topic"
    >
      Urgent
    </span>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function TopicCard({
  topic,
  onClick,
}: {
  topic: Topic;
  onClick: (id: TopicCategoryId) => void;
}) {
  const urgent = topic.urgency === "urgent";
  return (
    <button
      type="button"
      onClick={() => onClick(topic.id)}
      className={cx(
        "group w-full rounded-xl border p-4 text-left transition",
        "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        urgent && "border-2 border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/50 hover:bg-amber-50",
        !urgent && "border-border hover:bg-muted/50"
      )}
      aria-label={`Open topic: ${topic.uiTitle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-tight">{topic.uiTitle}</h3>
            {urgent ? <UrgentBadge /> : null}
          </div>
          <p className="text-sm text-muted-foreground">{topic.uiDescription}</p>
        </div>
        <span className="mt-1 text-sm text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">See your rights and next steps</div>
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
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <div className="text-base font-semibold">Prince George's County, MD</div>
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center gap-2 px-4">
          <Shield className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-semibold">RentWise</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Tenant Rights</span>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {/* Page header + location pill */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold sm:text-3xl">Get help with your rental problem</h1>
              <p className="text-muted-foreground">
                Choose a topic or describe what's happening to get step-by-step guidance.
              </p>
            </div>
            <div
              className="inline-flex items-center gap-3 rounded-full border bg-muted/30 px-4 py-2 text-sm"
              aria-label="Selected jurisdiction"
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>{labelForJurisdiction(jurisdiction)}</span>
              <button
                type="button"
                onClick={handleChangeJurisdiction}
                className="underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Change
              </button>
            </div>
          </div>

          {/* Chat-style help box */}
          <section
            ref={helpSectionRef}
            className="rounded-2xl border bg-card overflow-hidden flex flex-col"
            aria-labelledby="help-heading"
          >
            <div className="border-b bg-muted/30 px-4 py-3">
              <h2 id="help-heading" className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
                Ask for help (optional)
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Describe your situation. I&apos;ll ask a few questions and give step-by-step guidance for your area.
              </p>
            </div>
            <div className="px-4 py-2 flex items-start gap-2 border-b bg-amber-50/80 text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" aria-hidden />
              <p className="text-xs text-amber-900/90">{DISCLAIMER}</p>
            </div>
            <div
              ref={chatScrollRef}
              className="flex flex-col min-h-[200px] max-h-[420px] overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.length === 0 && !chatLoading && (
                <p className="text-sm text-muted-foreground">
                  Example: &quot;My landlord won&apos;t fix mold and I&apos;m not sure what to do.&quot; Type below or pick a prompt.
                </p>
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
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted border border-border"
                  )}
                >
                  {msg.role === "assistant" && (
                    <span className="block text-xs font-medium text-muted-foreground mb-1.5">Tenant Rights Guide</span>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted border border-border px-4 py-2.5 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
            </div>
            <div className="px-4 pt-2 flex flex-wrap gap-2 border-t bg-muted/20">
              {QUICK_PROMPTS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-input bg-background px-3 py-1.5 text-xs transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setQuestion((prev) => (prev ? prev + " " + chip : chip))}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2 items-end">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={chatMessages.length > 0 ? "Type a follow-up…" : "Describe your problem. Include dates, notices, and what you want to happen."}
                  className="min-h-[44px] max-h-32 flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 resize-none"
                  aria-label="Your message"
                  disabled={chatLoading}
                  rows={chatMessages.length > 0 ? 1 : 3}
                />
                <button
                  type="button"
                  onClick={startChat}
                  disabled={!question.trim() || chatLoading}
                  className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2 h-[44px]"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {chatMessages.length === 0 ? "Get Help" : "Send"}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Most common problems */}
        <section className="mt-8 space-y-4" aria-labelledby="common-heading">
          <SectionTitle
            title="Most common problems"
            subtitle="Pick what best matches your situation. You'll get the right steps for your location."
          />
          <div id="common-heading" className="sr-only" aria-hidden>Most common problems</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {commonTopics.map((t) => (
              <TopicCard key={t.id} topic={t} onClick={handleSelectTopic} />
            ))}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAllTopics((v) => !v)}
              className="underline underline-offset-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-expanded={showAllTopics}
            >
              {showAllTopics ? "Hide all topics" : "See all topics"}
            </button>
          </div>
          {showAllTopics && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {allTopics.map((t) => (
                <TopicCard key={t.id} topic={t} onClick={handleSelectTopic} />
              ))}
            </div>
          )}
        </section>

        {/* Topic details */}
        <section className="mt-10" aria-labelledby="topic-details-heading">
          <div
            id="topic-details-heading"
            ref={detailsRef}
            tabIndex={-1}
            className="rounded-2xl border p-5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Topic details"
          >
            {selectedTopic && category ? (
              <CategoryDetail
                category={category}
                jurisdiction={jurisdiction}
                onOpenChat={(prompt) => {
                  if (prompt) setQuestion(prompt);
                  helpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                scrollRef={undefined}
              />
            ) : (
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Choose a topic to see next steps</h2>
                <p className="text-sm text-muted-foreground">
                  Start with &quot;Most common problems&quot; above, or click &quot;See all topics.&quot;
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          This information is for educational purposes only and does not constitute legal advice. Verify with a licensed attorney or legal aid.
        </div>
      </footer>
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
