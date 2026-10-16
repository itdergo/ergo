/**
 * @file Database entry point — initialises the PostgreSQL connection pool and Drizzle ORM instance.
 *
 * This module is the single source of truth for database access across the entire
 * monorepo. It reads the `DATABASE_URL` environment variable (throwing immediately
 * if it is missing), creates a `pg.Pool`, wraps it in a Drizzle ORM client with the
 * full schema loaded, and re-exports the schema so consumers only need to import
 * from this one file.
 *
 * ## Usage
 * ```ts
 * import { db, pool, users, products } from "@repo/database";
 *
 * // Query example
 * const allProducts = await db.select().from(products).where(eq(products.status, "active"));
 * ```
 *
 * ## Environment Variables
 * - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgres://user:pass@host:5432/dbname`).
 *   Required at runtime; the module throws on import if it is not set.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Fail fast with a clear error message if the database URL is not configured.
// This prevents obscure connection errors later at query time.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

/**
 * Raw PostgreSQL connection pool. Exported separately so callers can run
 * raw SQL or manage transactions without going through Drizzle's query builder.
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Drizzle ORM client bound to the schema. Use this for all typed queries.
 * The `{ schema }` option registers all table relations so Drizzle can
 * auto-join related tables in `db.query.*` calls.
 */
export const db = drizzle(pool, { schema });

// Re-export the entire schema (tables, enums, relations, insert schemas, types)
// so that downstream packages only need to import from "@repo/database".
export * from "./schema";
