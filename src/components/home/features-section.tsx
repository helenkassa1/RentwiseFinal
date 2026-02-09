import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: "🔍",
      title: "Lease Review",
      badge: "FREE",
      description: "Instant compliance analysis for any lease",
      link: "/lease-review",
      linkText: "Try Now",
    },
    {
      icon: "🤖",
      title: "Rights Assistant",
      badge: "FREE",
      description: "AI legal guidance in plain English",
      link: "/tenant-rights",
      linkText: "Ask Question",
    },
    {
      icon: "🏢",
      title: "Full Platform",
      badge: "PAID",
      description: "Property mgmt + compliance tracking",
      link: "/pricing",
      linkText: "See Plans",
    },
  ];

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded mb-3">
                {feature.badge}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 min-h-[3rem]">{feature.description}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={feature.link}>{feature.linkText} →</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
