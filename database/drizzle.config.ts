/**
 * @file Drizzle Kit configuration — controls how database migrations are generated.
 *
 * Drizzle Kit is the CLI tool that reads this config to produce SQL migration files
 * from changes to the schema. Run `drizzle-kit generate` to create a new migration
 * after modifying `src/schema/index.ts`, and `drizzle-kit migrate` to apply pending
 * migrations to the database.
 *
 * ## Key Settings
 * - `schema` — Path to the schema file that defines all tables and enums.
 * - `dialect` — Set to "postgresql" for PostgreSQL databases.
 * - `dbCredentials.url` — Connection string used during migration generation.
 *   Falls back to "memory://" (no-op) if `DATABASE_URL` is not set, allowing
 *   `drizzle-kit generate` to run without a live database connection.
 *
 * ## Usage
 * ```bash
 * # Generate a new migration from schema changes
 * npx drizzle-kit generate
 *
 * # Apply all pending migrations
 * npx drizzle-kit migrate
 *
 * # Open the migration studio (GUI)
 * npx drizzle-kit studio
 * ```
 */
import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
  // Path to the schema file — all table and enum definitions live here
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    // DATABASE_URL is used when connecting to the database for migrations.
    // "memory://" is a safe fallback that allows generate to run offline.
    url: process.env.DATABASE_URL || "memory://",
  },
});
