"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, MessageSquare, BookOpen, Send, Loader2, User, Bot } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_QUESTIONS = [
  "Can my landlord raise my rent without notice?",
  "How long does my landlord have to return my security deposit?",
  "What are my rights if my apartment has mold?",
  "Can my landlord enter without permission?",
  "What should I do if I get an eviction notice?",
  "Is my landlord required to provide heat?",
];

const RIGHTS_CATEGORIES = [
  { id: "habitability", title: "Housing & Habitability", desc: "Safe living conditions, building codes, essential services", icon: "🏠" },
  { id: "rent-fees", title: "Rent & Fees", desc: "Rent increases, late fees, allowable charges", icon: "💰" },
  { id: "lease-contract", title: "Lease & Contract", desc: "Lease terms, renewals, prohibited clauses", icon: "📄" },
  { id: "eviction-termination", title: "Eviction & Termination", desc: "Notice requirements, just cause, illegal lockouts", icon: "🚪" },
  { id: "privacy-entry", title: "Privacy & Entry", desc: "Notice for entry, landlord access limits", icon: "🔒" },
  { id: "repairs-withholding", title: "Repairs & Rent Withholding", desc: "Repair timelines, escrow, tenant remedies", icon: "🔧" },
  { id: "anti-discrimination", title: "Anti-Discrimination", desc: "Fair housing, source of income, family status", icon: "⚖️" },
  { id: "organizing-retaliation", title: "Organizing & Retaliation", desc: "Tenant unions, retaliation protections", icon: "✊" },
];

export default function TenantRightsPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "browse">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("dc");

  // Auto-detect jurisdiction from tenant's property
  useEffect(() => {
    fetch("/api/tenant/my-home")
      .then((res) => res.json())
      .then((data) => {
        if (data.unit?.jurisdiction) setJurisdiction(data.unit.jurisdiction);
      })
      .catch(() => {});
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/tenant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          jurisdiction: jurisdiction === "pg_county" ? "pg" : "dc",
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble processing that. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Rights Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Get plain-English answers about your tenant rights in{" "}
          {jurisdiction === "dc" ? "Washington, DC" : jurisdiction === "pg_county" ? "Prince George&apos;s County" : "Maryland"}.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
        <strong>Note:</strong> This is an AI assistant, not legal advice. For legal counsel, contact a tenant rights attorney
        or your local legal aid office.
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "chat" ? "default" : "outline"}
          onClick={() => setActiveTab("chat")}
          className="flex-1"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Ask a Question
        </Button>
        <Button
          variant={activeTab === "browse" ? "default" : "outline"}
          onClick={() => setActiveTab("browse")}
          className="flex-1"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Browse by Topic
        </Button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <Card>
          <CardContent className="pt-6">
            {/* Quick questions */}
            {messages.length === 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-muted-foreground">Common questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      className="rounded-full border px-3 py-1.5 text-xs hover:bg-primary/5 hover:border-primary transition-colors"
                      onClick={() => sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.length > 0 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ask about your rights..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                disabled={sending}
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {RIGHTS_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`/tenant-rights?jurisdiction=${jurisdiction === "pg_county" ? "pg" : "dc"}#${cat.id}`}
              className="block"
            >
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{cat.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
