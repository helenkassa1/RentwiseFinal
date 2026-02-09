"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const DISCLAIMER = "This is not legal advice. For your specific situation, consult a licensed attorney or legal aid.";

export function TenantAIChat({
  jurisdiction,
  placeholder = "Ask about your lease or rights…",
}: {
  jurisdiction: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch("/api/tenant-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          jurisdiction,
          context: {}, // TODO: pass leaseSummary, rent status, etc.
        }),
      });
      const data = await res.json();
      const reply = data?.reply ?? "Sorry, I couldn’t process that. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Something went wrong. ${DISCLAIMER}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-semibold">Ask about your lease or rights</h3>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Plain-English answers. We’ll ask follow-up questions when needed. {DISCLAIMER}
        </p>
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Type a question below to get started.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === "user" ? "text-right" : "text-left"}
            >
              <span
                className={
                  msg.role === "user"
                    ? "inline-block rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "inline-block rounded-lg bg-muted px-3 py-2 text-sm"
                }
              >
                {msg.content}
              </span>
            </div>
          ))}
          {loading && (
            <p className="text-sm text-muted-foreground">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1"
            aria-label="Your question"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
