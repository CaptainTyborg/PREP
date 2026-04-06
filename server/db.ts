import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("===========================================");
  console.error("FATAL ERROR: DATABASE_URL is not set.");
  console.error("You must add a PostgreSQL database and");
  console.error("link it to this service on Render.com.");
  console.error("Go to: Dashboard > Your Service > Environment");
  console.error("and add DATABASE_URL with your PostgreSQL URL.");
  console.error("===========================================");
  process.exit(1);
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
