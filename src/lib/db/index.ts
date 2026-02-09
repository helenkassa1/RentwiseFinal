import { config } from "dotenv";

// Load .env and .env.local so DATABASE_URL is set when running standalone scripts (e.g. db:seed)
config();
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export type Database = typeof db;
