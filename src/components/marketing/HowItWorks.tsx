import { UserPlus, Send, ShieldCheck } from "lucide-react";

type Step = { title: string; desc: string; icon: string };

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Send,
  ShieldCheck,
};

export function HowItWorks({
  title,
  steps,
}: {
  title: string;
  steps: Step[];
}) {
  return (
    <section className="border-t py-16" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <h2
          id="how-it-works-heading"
          className="mb-10 text-center text-2xl font-bold"
        >
          {title}
        </h2>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon] ?? UserPlus;
            return (
              <div key={i} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" aria-hidden />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
