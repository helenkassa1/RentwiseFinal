import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VoucherNavigationPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Section 8 & Voucher Tools</h1>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Step-by-step DCHA and HAPGC workflows, HQS inspection prep, and HAP contract guidance.
        Available in the full platform for landlords and property managers.
      </p>
      <Button asChild>
        <Link href="/signup?type=landlord">Get Started for Landlords / PMs →</Link>
      </Button>
    </div>
  );
}
