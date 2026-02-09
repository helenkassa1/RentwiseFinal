import { z } from "zod";

const envSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),

  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = {
  get ANTHROPIC_API_KEY() { return process.env.ANTHROPIC_API_KEY!; },
  get OPENAI_API_KEY() { return process.env.OPENAI_API_KEY; },
  get DATABASE_URL() { return process.env.DATABASE_URL!; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY!; },
  get CLERK_SECRET_KEY() { return process.env.CLERK_SECRET_KEY!; },
  get RESEND_API_KEY() { return process.env.RESEND_API_KEY; },
  get STRIPE_SECRET_KEY() { return process.env.STRIPE_SECRET_KEY; },
  get STRIPE_WEBHOOK_SECRET() { return process.env.STRIPE_WEBHOOK_SECRET; },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; },
};
