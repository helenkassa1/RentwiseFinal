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

// Only wrap in Clerk when a real key is set (avoids crash when env is unset on Vercel)
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

const ClerkRoot =
  clerkPublishableKey.length > 0
    ? dynamic(() => import("./ClerkRoot").then((mod) => mod.ClerkRoot), { ssr: true })
    : null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
