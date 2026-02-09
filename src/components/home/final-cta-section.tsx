import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get compliant?</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup?type=landlord">For Landlords/PMs: Start Free Trial →</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link href="/signup?type=tenant">For Tenants: Access Free Tools →</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-primary-foreground/90">No credit card required</p>
      </div>
    </section>
  );
}
