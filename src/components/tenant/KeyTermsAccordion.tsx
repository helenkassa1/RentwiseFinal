"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { KeyTerm } from "@/lib/tenant/types";
import type { SuggestionChatPayload } from "@/lib/tenant/types";
import { InlineSuggestionChat } from "./InlineSuggestionChat";
import { InlineWordingFeedback } from "./InlineWordingFeedback";
import { ChevronDown, MessageCircle, FileEdit } from "lucide-react";

export type TenantContextSlice = SuggestionChatPayload["tenantContext"];

export function KeyTermsAccordion({
  terms,
  tenantContext,
}: {
  terms: KeyTerm[];
  tenantContext: TenantContextSlice;
}) {
  return (
    <section aria-labelledby="key-terms-heading">
      <h2 id="key-terms-heading" className="mb-3 text-lg font-semibold">
        Key terms
      </h2>
      <Accordion.Root type="single" collapsible className="space-y-2">
        {terms.map((term) => (
          <KeyTermItem
            key={term.id}
            term={term}
            tenantContext={tenantContext}
          />
        ))}
      </Accordion.Root>
    </section>
  );
}

function KeyTermItem({
  term,
  tenantContext,
}: {
  term: KeyTerm;
  tenantContext: TenantContextSlice;
}) {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState<"chat" | "wording">("chat");

  return (
    <Accordion.Item
      value={term.id}
      className="rounded-xl border bg-card"
    >
      <Accordion.Header>
        <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
          {term.termName}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform" aria-hidden />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="border-t px-4 pb-3 pt-2 text-sm text-muted-foreground">
          <p><strong>What it means:</strong> {term.whatItMeans}</p>
          <p className="mt-2"><strong>Why it matters:</strong> {term.whyItMatters}</p>
          {term.negotiationTip && (
            <p className="mt-2 text-primary">Tip: {term.negotiationTip}</p>
          )}
          {term.relatedRights && (
            <p className="mt-2 text-xs">Related rights: {term.relatedRights}</p>
          )}
          {term.clauseExcerpt && (
            <p className="mt-2 text-xs italic">From lease: &quot;{term.clauseExcerpt}&quot;</p>
          )}

          {/* AI help: collapsed by default */}
          <div className="mt-4 rounded-lg border bg-muted/20 p-3">
            {!aiPanelOpen ? (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Ask questions or get drafting help for this specific clause.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setAiPanelOpen(true);
                      setActiveAiTab("chat");
                    }}
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Ask about this
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setAiPanelOpen(true);
                      setActiveAiTab("wording");
                    }}
                  >
                    <FileEdit className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Try new wording
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">AI help for this clause</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setAiPanelOpen(false)}
                  >
                    Collapse
                  </Button>
                </div>
                <Tabs value={activeAiTab} onValueChange={(v) => setActiveAiTab(v as "chat" | "wording")}>
                  <TabsList className="h-8 w-full grid grid-cols-2">
                    <TabsTrigger value="chat" className="text-xs">
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="wording" className="text-xs">
                      Wording Review
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="mt-3">
                    <InlineSuggestionChat
                      tenantContext={tenantContext}
                      termId={term.id}
                      termData={term}
                    />
                  </TabsContent>
                  <TabsContent value="wording" className="mt-3">
                    <InlineWordingFeedback
                      tenantContext={tenantContext}
                      termId={term.id}
                      termData={term}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
