import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

// Font: --font-inter is set in globals.css (system stack) so build does not require Google Fonts.
// To use Inter from Google: import { Inter } from "next/font/google"; then use inter.variable on body.
export const metadata: Metadata = {
  title: "RentWise — AI-Powered Property Management",
  description:
    "AI-powered property management platform for Washington D.C., Maryland, and Prince George's County. Legal compliance, lease review, and tenant management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
