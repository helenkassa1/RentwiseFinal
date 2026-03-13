import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./providers";

// Font: --font-inter is set in globals.css (system stack) so build does not require Google Fonts.
export const metadata: Metadata = {
  title: "RentWise — AI-Powered Property Management",
  description:
    "AI-powered property management platform for Washington D.C., Maryland, and Prince George's County. Legal compliance, lease review, and tenant management.",
};

// Placeholder used only when env is unset (e.g. Vercel build). Real key must be set in Vercel for auth to work.
const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || "pk_test_build_placeholder";

const ClerkRoot = dynamic(
  () => import("./ClerkRoot").then((mod) => mod.ClerkRoot),
  { ssr: true }
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  return <ClerkRoot publishableKey={clerkPublishableKey}>{content}</ClerkRoot>;
}
