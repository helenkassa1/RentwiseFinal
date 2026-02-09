import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Wrench,
  MessageSquare,
  FileCheck,
  FileText,
  Bell,
} from "lucide-react";
import { TENANT_PORTAL_PAGE } from "@/content/marketing";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

const featureIcons = [
  DollarSign,
  Wrench,
  MessageSquare,
  FileCheck,
  FileText,
  Bell,
];

export default function TenantPortalPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">
          {TENANT_PORTAL_PAGE.title}
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-muted-foreground">
          {TENANT_PORTAL_PAGE.subtitle}
        </p>

        {/* How access works */}
        <section className="mb-12 rounded-xl border bg-slate-50/50 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            {TENANT_PORTAL_PAGE.howAccessWorks.title}
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            {TENANT_PORTAL_PAGE.howAccessWorks.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold">
            {TENANT_PORTAL_PAGE.featuresTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TENANT_PORTAL_PAGE.features.map((feature, i) => {
              const Icon = featureIcons[i] ?? FileText;
              return (
                <div
                  key={i}
                  className="flex gap-4 rounded-xl border p-4"
                >
                  <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm">{feature}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Link href={TENANT_PORTAL_PAGE.ctas[0].href}>
            <Button size="lg">{TENANT_PORTAL_PAGE.ctas[0].label}</Button>
          </Link>
          <Link href={TENANT_PORTAL_PAGE.ctas[1].href}>
            <Button size="lg" variant="outline">
              {TENANT_PORTAL_PAGE.ctas[1].label}
            </Button>
          </Link>
        </section>

        {/* Request invite anchor for scroll */}
        <div id="request-invite" className="mt-16 scroll-mt-24">
          <p className="mb-4 text-sm text-muted-foreground">
            Don&apos;t have an invite yet? Ask your landlord or property
            manager to add you through their RentWise account. Once they send
            an invite, you can sign up and connect to your rental.
          </p>
        </div>

        <p className="mt-12 border-t pt-8">
          <Link
            href={TENANT_PORTAL_PAGE.landlordLink.href}
            className="text-sm font-medium text-primary hover:underline"
          >
            {TENANT_PORTAL_PAGE.landlordLink.label}
          </Link>
        </p>
      </div>

      <MarketingFooter />
    </div>
  );
}
