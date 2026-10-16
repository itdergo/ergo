/**
 * Redis client and caching helpers.
 *
 * Provides an optional caching layer. If REDIS_URL is not set, the app runs
 * without a cache (all helpers degrade to no-ops) so Redis is never a hard
 * dependency for local development.
 *
 * The connection is lazily established on first use and shared across all
 * requests. Errors are logged but never thrown — the app continues to
 * function without cache if Redis becomes unavailable.
 *
 * Environment variables:
 *   - REDIS_URL (optional): Redis connection URL (e.g., "redis://localhost:6379")
 *
 * Exports:
 *   - redisEnabled: boolean indicating if Redis is configured
 *   - cacheGet: read a JSON value from cache
 *   - cacheSet: write a JSON value to cache with TTL
 *   - cacheDel: delete cache keys matching a glob pattern
 *   - cacheAside: cache-aside pattern helper
 *   - closeRedis: gracefully close the Redis connection
 */

import { createClient, type RedisClientType } from "redis";
import { logger } from "./logger";

const REDIS_URL = process.env["REDIS_URL"];

export const redisEnabled = Boolean(REDIS_URL);

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;

/**
 * Lazily connect to Redis and return the client.
 *
 * Uses a shared promise to prevent connection storms — if multiple requests
 * trigger getClient() before the first connection completes, they all await
 * the same promise.
 *
 * @returns the connected Redis client, or null if Redis is not configured or unavailable
 */
async function getClient(): Promise<RedisClientType | null> {
  if (!REDIS_URL) return null;
  if (client?.isOpen) return client;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      const c = createClient({ url: REDIS_URL });
      // Log Redis errors but don't crash — caching is best-effort.
      c.on("error", (err) => logger.warn({ err }, "Redis client error"));
      await c.connect();
      client = c as RedisClientType;
      logger.info("Redis connected");
      return client;
    } catch (err) {
      logger.warn({ err }, "Redis unavailable — running without cache");
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

/**
 * Read a JSON value from cache.
 *
 * @param key - the cache key
 * @returns the cached value, or null on miss or when Redis is disabled
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = await getClient();
  if (!c) return null;
  try {
    const raw = await c.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, "cacheGet failed");
    return null;
  }
}

/**
 * Write a JSON value to cache with a TTL.
 *
 * @param key - the cache key
 * @param value - the value to cache (will be JSON-serialized)
 * @param ttlSeconds - time-to-live in seconds (default: 60)
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const c = await getClient();
  if (!c) return;
  try {
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    logger.warn({ err, key }, "cacheSet failed");
  }
}

/**
 * Delete cache keys matching a glob pattern.
 *
 * @param pattern - a glob pattern (e.g., "products:*" deletes all product cache entries)
 */
export async function cacheDel(pattern: string): Promise<void> {
  const c = await getClient();
  if (!c) return;
  try {
    const keys = await c.keys(pattern);
    if (keys.length) await c.del(keys);
  } catch (err) {
    logger.warn({ err, pattern }, "cacheDel failed");
  }
}

/**
 * Cache-aside helper: return cached value if present, otherwise run `fn`,
 * store the result, and return it.
 *
 * This is the recommended pattern for caching database queries — the caller
 * provides a function that fetches fresh data, and this helper handles the
 * cache lookup and population transparently.
 *
 * @param key - the cache key
 * @param ttlSeconds - TTL for the cached value
 * @param fn - async function that produces the value on cache miss
 * @returns the cached or freshly-computed value
 */
export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const fresh = await fn();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

/**
 * Gracefully close the Redis connection.
 * Called during server shutdown to release resources cleanly.
 */
export async function closeRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
    client = null;
  }
}
