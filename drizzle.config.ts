import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env then .env.local so DATABASE_URL is available for db:push / db:studio
config();
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
