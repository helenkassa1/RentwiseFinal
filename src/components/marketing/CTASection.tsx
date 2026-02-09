import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type CTA = { label: string; href: string };

export function CTASection({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  tertiaryLink,
  missionLine,
}: {
  title: string;
  subtitle: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  tertiaryLink?: CTA;
  missionLine?: string;
}) {
  return (
    <section className="border-t bg-primary py-16 text-primary-foreground" aria-labelledby="final-cta-heading">
      <div className="container mx-auto px-4 text-center">
        <h2 id="final-cta-heading" className="mb-4 text-3xl font-bold">
          {title}
        </h2>
        <p className="mb-8 text-primary-foreground/90">{subtitle}</p>
        {missionLine && (
          <p className="mb-6 text-sm text-primary-foreground/80">
            {missionLine}
          </p>
        )}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={primaryCta.href}>
            <Button size="lg" variant="secondary">
              {primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={secondaryCta.href}>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              {secondaryCta.label}
            </Button>
          </Link>
        </div>
        {tertiaryLink && (
          <p className="mt-6">
            <Link
              href={tertiaryLink.href}
              className="text-sm underline underline-offset-2 hover:no-underline"
            >
              {tertiaryLink.label}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
