import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const hasClerkKeys =
  typeof process.env.CLERK_SECRET_KEY === "string" &&
  process.env.CLERK_SECRET_KEY.trim() !== "" &&
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.trim() !== "";

export default async function middleware(request: NextRequest) {
  if (!hasClerkKeys) {
    return NextResponse.next();
  }
  try {
    const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
    const isPublic = createRouteMatcher([
      "/",
      "/sign-in(.*)",
      "/sign-up(.*)",
      "/signup(.*)",
      "/tenant-rights(.*)",
      "/rights-assistant(.*)",
      "/lease-review",
      "/pricing",
      "/privacy",
      "/terms",
      "/contact",
      "/voucher-navigation",
      "/api/webhooks(.*)",
      "/api/inngest(.*)",
      "/api/lease/review",
      "/api/lease/extract-text",
      "/api/tenant-ai(.*)",
      "/api/tenant-chat(.*)",
    ]);
    const handler = clerkMiddleware(async (auth, req) => {
      try {
        if (!isPublic(req)) {
          await auth.protect();
        }
      } catch {
        return NextResponse.next();
      }
    });
    return await handler(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
