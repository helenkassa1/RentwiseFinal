import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Stay compliant. Navigate vouchers. Protect your rights.
        </h1>
        <p className="text-xl text-muted-foreground">
          AI-powered legal tools for DC & Maryland landlords, property managers, and tenants
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/signup?type=landlord" className="block">
            <div className="text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-2xl font-bold mb-4">
                I&apos;m a Landlord/Property Manager
              </h2>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>• Legal compliance tools</li>
                <li>• Section 8/voucher navigation</li>
                <li>• Lease review & generation</li>
              </ul>
              <Button className="w-full" size="lg">
                Get Started →
              </Button>
            </div>
          </Link>
        </Card>

        <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/signup?type=tenant" className="block">
            <div className="text-center">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold mb-4">I&apos;m a Tenant</h2>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li>• Know my rights</li>
                <li>• Free legal guidance</li>
                <li>• Document issues properly</li>
              </ul>
              <Button className="w-full" size="lg" variant="outline">
                Get Started →
              </Button>
            </div>
          </Link>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild size="lg" className="h-14 px-8 text-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg">
          <Link href="/lease-review">
            Is your lease enforceable? Try our Lease Review Tool - Free, no account needed →
          </Link>
        </Button>
      </div>
    </section>
  );
}
