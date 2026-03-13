import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
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
  "/api/tenant-ai",
  "/api/tenant-ai/suggestion-chat",
  "/api/tenant-ai/wording-review",
  "/api/tenant-chat",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
