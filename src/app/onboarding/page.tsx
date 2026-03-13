"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Building2, Key, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "landlord",
    label: "Landlord",
    icon: Building2,
    description: "I own rental properties and manage them directly.",
    href: "/dashboard",
  },
  {
    id: "property-manager",
    label: "Property Manager",
    icon: Building2,
    description: "I manage properties on behalf of owners.",
    href: "/dashboard",
  },
  {
    id: "tenant",
    label: "Tenant",
    icon: Key,
    description: "I rent a home and want to know my rights.",
    href: "/tenant",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Shield className="h-6 w-6" aria-hidden />
            RentWise
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to RentWise!</h1>
          <p className="text-muted-foreground">
            Tell us about yourself so we can personalize your experience.
          </p>
          <div className="space-y-3">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all ${selected === role.id ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
                onClick={() => setSelected(role.id)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <role.icon className="h-8 w-8 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={!selected}
            onClick={() => {
              const role = roles.find((r) => r.id === selected);
              if (role) router.push(role.href);
            }}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
