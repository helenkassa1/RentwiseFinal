"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Copy, Loader2 } from "lucide-react";
import type { KeyTerm } from "@/lib/tenant/types";
import type { SuggestionChatPayload } from "@/lib/tenant/types";
import type { SuggestionChatResponse } from "@/lib/tenant/types";

type Message = { role: "user" | "assistant"; content: string };

export function InlineSuggestionChat({
  tenantContext,
  termId,
  termData,
}: {
  tenantContext: SuggestionChatPayload["tenantContext"];
  termId: string;
  termData: KeyTerm;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [suggestedDrafts, setSuggestedDrafts] = useState<SuggestionChatResponse["suggestedDrafts"]>([]);
  const [lastDisclaimer, setLastDisclaimer] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(userContent?: string) {
    const content = (userContent ?? input.trim()) || "";
    if (!content || loading) return;
    if (!userContent) setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setFollowUps([]);
    setSuggestedDrafts([]);
    setLastDisclaimer(null);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/tenant-ai/suggestion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantContext,
          termId,
          termData,
          userMessage: content,
          conversationHistory: history,
        } satisfies SuggestionChatPayload),
      });
      let data: (SuggestionChatResponse & { error?: string }) | null = null;
      try {
        data = (await res.json()) as SuggestionChatResponse & { error?: string };
      } catch {
        // Non-JSON response (e.g. 500 HTML)
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "The server couldn’t respond properly. Please try again." },
        ]);
        return;
      }
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data?.error ?? "Something went wrong. Please try again." },
        ]);
        return;
      }
      if (!data) return;
      setMessages((m) => [...m, { role: "assistant", content: data.assistantMessage }]);
      setFollowUps(data.followUpQuestions ?? []);
      setSuggestedDrafts(data.suggestedDrafts ?? []);
      setLastDisclaimer(data.disclaimer ?? null);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I couldn’t process that right now. Please try again. This isn’t legal advice—consult an attorney for your situation.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
        Ask about this clause
      </div>
      <p className="text-xs text-muted-foreground">
        Get explanations, negotiation options, and draft messages. We’ll ask follow-ups when needed.
      </p>
      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            e.g. “What if I pay a few days late?” or “How do I ask for a waiver?”
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                msg.role === "user"
                  ? "inline-block rounded-lg bg-primary px-2 py-1.5 text-xs text-primary-foreground"
                  : "inline-block rounded-lg bg-muted px-2 py-1.5 text-xs"
              }
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      {followUps.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {followUps.map((q, i) => (
            <Button
              key={i}
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => send(q)}
            >
              {q}
            </Button>
          ))}
        </div>
      )}
      {suggestedDrafts && suggestedDrafts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Suggested drafts</p>
          {suggestedDrafts.map((d, i) => (
            <div key={i} className="rounded-lg border bg-muted/20 p-2">
              <p className="text-xs font-medium">{d.label}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{d.text}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 text-xs"
                onClick={() => navigator.clipboard.writeText(d.text)}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
          ))}
        </div>
      )}
      {lastDisclaimer && (
        <p className="text-xs italic text-muted-foreground">{lastDisclaimer}</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={loading}
          className="flex-1 text-sm"
          aria-label="Your question"
        />
        <Button type="submit" size="sm" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
