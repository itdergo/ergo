/**
 * Cache control middleware.
 *
 * Provides two middleware functions for setting Cache-Control headers
 * on responses:
 *
 * 1. cachePublic — marks responses as publicly cacheable with a configurable
 *    max-age and stale-while-revalidate. Used for catalogue data (products,
 *    categories, etc.) that benefits from CDN/browser caching.
 *
 * 2. noStore — marks responses as non-cacheable. Used for authenticated
 *    or sensitive data that must never be stored in caches.
 *
 * A blanket Cache-Control on every GET would leak lead/PII responses into
 * shared caches, so caching is opt-in per route.
 *
 * Exports:
 *   - cachePublic: middleware factory for public caching
 *   - noStore: middleware for no-cache responses
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Per-route cache policy. A blanket Cache-Control on every GET leaks
 * lead/PII responses into shared caches, so policy is opt-in per route.
 */

/**
 * Public, cacheable content (catalogue data).
 *
 * Sets Cache-Control with public visibility, a max-age, and a
 * stale-while-revalidate window. This allows CDNs and browsers to cache
 * the response, reducing server load for static-ish catalogue content.
 *
 * @param seconds - max-age in seconds (default: 60)
 * @param staleWhileRevalidate - stale-while-revalidate in seconds (default: 300)
 * @returns middleware function
 */
export function cachePublic(seconds = 60, staleWhileRevalidate = 300) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`,
    );
    next();
  };
}

/**
 * Never cache — sensitive or authenticated responses.
 *
 * Sets Cache-Control: no-store, which prevents the response from being
 * stored in any cache (browser, CDN, or intermediary).
 */
export function noStore(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Cache-Control", "no-store");
  next();
}
