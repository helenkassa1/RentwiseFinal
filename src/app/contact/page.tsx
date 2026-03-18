"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/navigation/main-nav";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNav />
      <main className="container mx-auto max-w-xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
        <p className="text-muted-foreground text-center mb-8">
          Have a question or need help? We&apos;d love to hear from you.
        </p>
        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you within 1-2 business days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <input id="name" type="text" required className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input id="email" type="email" required className="w-full rounded-md border px-3 py-2 text-sm" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                  <textarea id="message" required rows={5} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="How can we help?" />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
