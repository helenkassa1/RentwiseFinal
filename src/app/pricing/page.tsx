import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { MainNav } from "@/components/navigation/main-nav";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For private landlords with 1-2 units",
    features: [
      "Up to 2 units",
      "Lease template generator (2/month)",
      "Lease reviewer (2/month)",
      "Tenant Rights Portal (full access)",
      "Basic maintenance tracking",
      "Move-in/move-out inspections",
      "Notification alerts",
    ],
    limitations: ["RentWise AI branding on documents", "No contractor integration", "Email support only"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Landlord Pro",
    price: "$15",
    period: "/month",
    description: "Up to 10 units + $3/unit beyond 10",
    features: [
      "Everything in Free",
      "Unlimited lease reviews & generation",
      "Voucher Tenant Navigator",
      "Contractor recommendations",
      "Full notification system",
      "Move-in/move-out comparison reports",
      "Priority email support",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Property Manager",
    price: "$49",
    period: "/month + $2/unit",
    description: "For PM companies. Volume discounts at 100+ units",
    features: [
      "Everything in Landlord Pro",
      "Team member accounts with RBAC",
      "Portfolio-wide compliance dashboard",
      "Bulk lease review",
      "API access for PMS integration",
      "Dedicated account support",
      "Custom branding on tenant pages",
    ],
    limitations: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h1>
          <p className="mt-3 text-lg text-muted-foreground">Free for small landlords. Scales with your portfolio.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
              {plan.highlighted && (
                <div className="rounded-t-xl bg-primary px-4 py-1.5 text-center text-sm font-medium text-white">Most Popular</div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/sign-up">
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
                <div className="space-y-2">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                {plan.limitations.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    {plan.limitations.map((l) => (
                      <p key={l} className="text-xs text-muted-foreground">• {l}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold">Public Access — Always Free</h3>
          <p className="mt-2 text-muted-foreground">
            The Tenant Rights Portal is always free with no login required. One free lease review preview is available without an account.
          </p>
        </div>
      </div>
    </div>
  );
}
