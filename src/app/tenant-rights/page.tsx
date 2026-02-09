"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, MapPin, AlertCircle } from "lucide-react";
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
      if (!res.ok) throw new Error(data.error || "Request failed");
      setChatMessages((m) => [...m, { role: "assistant", content: data.content }]);
    } catch {
      setChatMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, I couldn't get a response. Please try again. ${DISCLAIMER}` },
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

          {/* Help box */}
          <section
            className="rounded-2xl border bg-card p-4 sm:p-5"
            aria-labelledby="help-heading"
          >
            <h2 id="help-heading" className="text-lg font-semibold">Ask for help (optional)</h2>
            <p className="mt-1 text-sm text-muted-foreground">Example: &quot;My landlord won&apos;t fix mold and I&apos;m not sure what to do.&quot;</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe your problem. Include dates, notices, and what you want to happen."
                className="min-h-[110px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                aria-label="Describe your problem"
                disabled={chatLoading}
              />
              <button
                type="button"
                onClick={startChat}
                disabled={!question.trim() || chatLoading}
                className={cx(
                  "rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                {chatLoading ? "Sending…" : "Get Help"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
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
            {chatMessages.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border bg-muted/30 p-2">
                  <p className="text-xs font-medium text-muted-foreground">{DISCLAIMER}</p>
                </div>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cx(
                      "rounded-xl border p-3 text-sm",
                      msg.role === "user"
                        ? "ml-4 border-primary/30 bg-primary/10"
                        : "mr-4 bg-muted/50"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
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
