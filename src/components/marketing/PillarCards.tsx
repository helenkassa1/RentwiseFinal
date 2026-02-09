import Link from "next/link";
import { Scale, MessageSquare, Building2 } from "lucide-react";
import type { Pillar } from "@/content/marketing";
import { Button } from "@/components/ui/button";

const iconMap = {
  Scale,
  MessageSquare,
  Building2,
};

const themeClasses = {
  blue: "bg-blue-50/80 border-blue-100",
  green: "bg-emerald-50/80 border-emerald-100",
  purple: "bg-violet-50/80 border-violet-100",
};

export function PillarCards({ pillars }: { pillars: Pillar[] }) {
  return (
    <section
      className="py-16"
      aria-labelledby="three-ways-heading"
    >
      <div className="container mx-auto px-4">
        <h2
          id="three-ways-heading"
          className="mb-10 text-center text-2xl font-bold md:text-3xl"
        >
          3 ways to use RentWise
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = iconMap[pillar.icon];
            return (
              <div
                key={pillar.id}
                className={`rounded-2xl border p-6 ${themeClasses[pillar.theme]}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-6 w-6 text-foreground" aria-hidden />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {pillar.eyebrow}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{pillar.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {pillar.subtitle}
                </p>
                <ul className="mb-5 space-y-2 text-sm">
                  {pillar.bullets.slice(0, 6).map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-xs text-muted-foreground">
                  {pillar.note}
                </p>
                <Link href={pillar.ctaHref}>
                  <Button className="w-full" variant={pillar.theme === "purple" ? "default" : "secondary"}>
                    {pillar.ctaLabel}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
