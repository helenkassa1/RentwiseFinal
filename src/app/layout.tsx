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

// Always load ClerkRoot — it handles missing keys gracefully at runtime
const ClerkRoot = dynamic(() => import("./ClerkRoot").then((mod) => mod.ClerkRoot), { ssr: true });

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
