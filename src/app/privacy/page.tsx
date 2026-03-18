import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";

export const metadata = { title: "Privacy Policy — RentWise" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNav />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none space-y-4">
          <p className="text-muted-foreground">Last updated: March 2026</p>
          <h2 className="text-xl font-semibold mt-8">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, using our lease review tools, or contacting us. This includes your name, email address, and any lease documents you upload for analysis.</p>
          <h2 className="text-xl font-semibold mt-8">2. How We Use Your Information</h2>
          <p>Your information is used to provide our AI-powered lease review and compliance tools, improve our services, and communicate with you about your account.</p>
          <h2 className="text-xl font-semibold mt-8">3. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. Uploaded lease documents are processed securely and are not shared with third parties.</p>
          <h2 className="text-xl font-semibold mt-8">4. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information at any time. Contact us at support@rentwise.app for any privacy-related requests.</p>
          <h2 className="text-xl font-semibold mt-8">5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.</p>
        </div>
      </main>
    </div>
  );
}
