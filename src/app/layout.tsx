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

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

// Only load Clerk when key is set — avoids "Missing publishableKey" during prerender/build when env is unset
const ClerkRoot = clerkPublishableKey
  ? dynamic(
      () => import("./ClerkRoot").then((mod) => mod.ClerkRoot),
      { ssr: true }
    )
  : null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (ClerkRoot && clerkPublishableKey) {
    return <ClerkRoot publishableKey={clerkPublishableKey}>{content}</ClerkRoot>;
  }

  return content;
}
