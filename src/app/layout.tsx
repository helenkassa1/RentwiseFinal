import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./providers";

// Force all pages to render at runtime so ClerkProvider is always available
export const dynamic = "force-dynamic";

// Font: --font-inter is set in globals.css (system stack) so build does not require Google Fonts.
export const metadata: Metadata = {
  title: "RentWise — AI-Powered Property Management",
  description:
    "AI-powered property management platform for Washington D.C., Maryland, and Prince George's County. Legal compliance, lease review, and tenant management.",
};

// Always load ClerkRoot — it handles missing keys gracefully at runtime
const ClerkRoot = nextDynamic(() => import("./ClerkRoot").then((mod) => mod.ClerkRoot), { ssr: true });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkRoot>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkRoot>
  );
}
