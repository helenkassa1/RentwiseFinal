"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/shared";
import { trackTenantRights } from "@/lib/tenant-rights/analytics";
import { Send, MessageCircle, AlertCircle } from "lucide-react";

const DISCLAIMER =
  "I'm not a lawyer and this isn't legal advice. For advice on your specific situation, talk to a local tenant attorney or legal aid.";

const QUICK_PROMPTS = [
  "My landlord won't make repairs",
  "I got an eviction notice",
  "My deposit wasn't returned",
  "Landlord entered without notice",
  "Rent increased—can they do that?",
];

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function TenantChat({
  jurisdiction,
  selectedCategory,
  isOpen,
  onClose,
  suggestedPrompt,
}: {
  jurisdiction: "dc" | "pg" | null;
  selectedCategory?: string;
  isOpen: boolean;
  onClose?: () => void;
  suggestedPrompt?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (suggestedPrompt && isOpen) {
      setInput(suggestedPrompt);
    }
  }, [suggestedPrompt, isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    if (!jurisdiction) {
      setMessages((m) => [...m, { role: "user", content: trimmed }, { role: "assistant", content: "Please select your jurisdiction (Washington, D.C. or Prince George's County) above so I can give you accurate information." }]);
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    if (messages.length === 0) trackTenantRights({ name: "chat_started", jurisdiction, categoryId: selectedCategory });

    try {
      const res = await fetch("/api/tenant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          jurisdiction,
          selectedCategory,
          kbSnippets: undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      trackTenantRights({ name: "chat_followup_answered", messageLength: trimmed.length });
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't get a response. Please try again. " + DISCLAIMER },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="flex flex-col h-[480px] md:h-[520px] sticky top-4" aria-label="Tenant Rights chat">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" aria-hidden /> Ask a question
        </CardTitle>
        {onClose && (
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-4 pt-0">
        <div className="rounded-md border bg-muted/30 p-2 mb-3 flex items-start gap-2" role="status">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden />
          <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-[200px]" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Describe your situation or pick a prompt below. I'll ask a few follow-up questions before giving guidance.</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "ml-4 bg-primary text-primary-foreground" : "mr-4 bg-muted"}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground">Thinking…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="text-xs rounded-full border bg-background px-3 py-1.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your situation…"
            className="min-h-[80px] resize-none"
            disabled={loading}
            aria-label="Your message"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
