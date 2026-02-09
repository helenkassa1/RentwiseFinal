import Link from "next/link";
import { Shield } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <span className="font-semibold">RentWise</span>
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            RentWise provides compliance guidance, not legal advice. Consult a
            licensed attorney for legal decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
