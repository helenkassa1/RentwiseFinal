"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRuleCardsForCategory } from "@/lib/tenant-rights/categories";
import type { Category, Jurisdiction, RuleCard } from "@/lib/tenant-rights/types";
import { JURISDICTION_LABELS } from "@/lib/tenant-rights/types";
import { trackTenantRights } from "@/lib/tenant-rights/analytics";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function CategoryDetail({
  category,
  jurisdiction,
  onOpenChat,
  scrollRef,
}: {
  category: Category;
  jurisdiction: Jurisdiction;
  onOpenChat?: (suggestedPrompt?: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null> | null;
}) {
  const ruleCards = getRuleCardsForCategory(category, jurisdiction);
  const verifiedDeadlines = ruleCards.flatMap((r) => r.deadlines.filter((d) => !d.verify));
  const verifyDeadlines = ruleCards.flatMap((r) => r.deadlines.filter((d) => d.verify));
  const allSteps = ruleCards.flatMap((r) => r.steps);
  const allEvidence = [...new Set(ruleCards.flatMap((r) => r.evidence))];
  const allContacts = ruleCards.flatMap((r) => r.contacts);
  const needsVerification = ruleCards.flatMap((r) =>
    r.legalCites.filter((c) => c.verify).map((c) => ({ title: r.title, cite: c }))
  );

  return (
    <div ref={scrollRef ?? undefined} className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold" id="category-detail-heading">
          {category.title} in {JURISDICTION_LABELS[jurisdiction]}
        </h2>
      </header>

      {category.scenarioShortcuts && category.scenarioShortcuts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Common scenarios</h3>
          <div className="flex flex-wrap gap-2">
            {category.scenarioShortcuts.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  trackTenantRights({ name: "subtopic_selected", categoryId: category.id, subtopicId: s.subtopicId ?? s.id });
                  onOpenChat?.(s.title);
                }}
              >
                {s.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="key-rules" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1" aria-label="Category detail sections">
          <TabsTrigger value="key-rules">Key rules</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines & notices</TabsTrigger>
          <TabsTrigger value="steps">Step-by-step actions</TabsTrigger>
          <TabsTrigger value="documents">Documents to gather</TabsTrigger>
          <TabsTrigger value="help">Where to get help</TabsTrigger>
        </TabsList>

        <TabsContent value="key-rules" className="mt-4 space-y-4">
          {ruleCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              PG County specifics may depend on Maryland law and county code. Add content in the data model for this category.
            </p>
          ) : (
            <>
              {ruleCards.map((card, i) => (
                <RuleCardBlock key={i} card={card} showVerify={false} />
              ))}
              {needsVerification.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Needs verification</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      {needsVerification.map((v, i) => (
                        <li key={i}>{v.cite.cite} — verify with official source</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="deadlines" className="mt-4 space-y-4">
          {verifiedDeadlines.length > 0 && (
            <ul className="list-disc pl-4 space-y-2">
              {verifiedDeadlines.map((d, i) => (
                <li key={i}>
                  <strong>{d.label}:</strong> {d.detail}
                </li>
              ))}
            </ul>
          )}
          {verifyDeadlines.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-sm">Verify these deadlines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc pl-4 space-y-1">
                  {verifyDeadlines.map((d, i) => (
                    <li key={i}>{d.label}: {d.detail}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {verifiedDeadlines.length === 0 && verifyDeadlines.length === 0 && (
            <p className="text-sm text-muted-foreground">No deadlines loaded for this category. Ask in the chat or check official sources.</p>
          )}
        </TabsContent>

        <TabsContent value="steps" className="mt-4">
          <ol className="list-decimal pl-6 space-y-2">
            {allSteps.length > 0 ? allSteps.map((step, i) => <li key={i}>{step}</li>) : <li className="text-muted-foreground">No steps loaded. Use the chat for guidance.</li>}
          </ol>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <ul className="list-disc pl-4 space-y-1">
            {allEvidence.length > 0 ? allEvidence.map((e, i) => <li key={i}>{e}</li>) : <li className="text-muted-foreground">No checklist loaded. Use the chat for guidance.</li>}
          </ul>
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <ul className="space-y-3">
            {allContacts.length > 0 ? (
              allContacts.map((c, i) => (
                <li key={i}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {c.name}
                  </a>
                  {c.description && <span className="text-muted-foreground"> — {c.description}</span>}
                  {c.phone && <span className="text-muted-foreground"> {c.phone}</span>}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No contacts loaded. Search official DC or PG County housing resources.</li>
            )}
          </ul>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="text-sm font-medium">Not sure? Ask the Tenant Rights Guide.</p>
          <Button type="button" onClick={() => onOpenChat?.()} aria-label="Open chat">
            <MessageCircle className="mr-2 h-4 w-4" /> Ask a question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RuleCardBlock({ card, showVerify }: { card: RuleCard; showVerify: boolean }) {
  const cites = showVerify ? card.legalCites : card.legalCites.filter((c) => !c.verify);
  if (cites.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{card.plainEnglish}</p>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Sources</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {cites.map((c, i) => (
              <li key={i}>
                {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{c.cite}</a> : c.cite}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
