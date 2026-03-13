import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Terms of Service — RentWise" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Shield className="h-6 w-6" aria-hidden />
            RentWise
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-slate max-w-none space-y-4">
          <p className="text-muted-foreground">Last updated: March 2026</p>
          <h2 className="text-xl font-semibold mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using RentWise, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          <h2 className="text-xl font-semibold mt-8">2. AI-Powered Analysis Disclaimer</h2>
          <p>RentWise provides AI-powered lease review and legal compliance tools for informational purposes only. Our analysis does not constitute legal advice from a licensed attorney. Results should be verified by a qualified legal professional.</p>
          <h2 className="text-xl font-semibold mt-8">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          <h2 className="text-xl font-semibold mt-8">4. Acceptable Use</h2>
          <p>You agree to use RentWise only for lawful purposes related to property management, lease review, and tenant rights education.</p>
          <h2 className="text-xl font-semibold mt-8">5. Contact</h2>
          <p>For questions about these terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.</p>
        </div>
      </main>
    </div>
  );
}
