import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, MessageSquare, Building2 } from "lucide-react";

export function NextStepChooser() {
  return (
    <section
      className="border-t bg-slate-50/50 py-16"
      aria-labelledby="next-step-heading"
    >
      <div className="container mx-auto px-4">
        <h2
          id="next-step-heading"
          className="mb-6 text-center text-xl font-bold"
        >
          What are you here for?
        </h2>
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" className="h-auto flex-1 flex-col gap-2 py-4" asChild>
            <Link href="/tenant-rights" className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <Scale className="h-5 w-5" aria-hidden />
                I&apos;m a tenant
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Free tools or tenant portal
              </span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-1 flex-col gap-2 py-4" asChild>
            <Link href="/sign-up" className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5" aria-hidden />
                I&apos;m a landlord
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Create management account
              </span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-1 flex-col gap-2 py-4" asChild>
            <Link href="/sign-up" className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" aria-hidden />
                I manage clients
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Create PM account
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
