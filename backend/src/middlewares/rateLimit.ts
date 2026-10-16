/**
 * Rate limiting middleware.
 *
 * Provides three pre-configured rate limiters using express-rate-limit:
 *
 * 1. apiLimiter — general API rate limit (600 req / 15 min per IP).
 *    Applied globally to all /api routes in app.ts.
 *
 * 2. authLimiter — strict limit for credential endpoints (10 req / 15 min per IP).
 *    Applied to the login route to slow brute-force attacks.
 *    Successful requests don't count against the limit.
 *
 * 3. publicWriteLimiter — limits the public inquiry form (5 req / 10 min per IP).
 *    Applied to the public inquiry submission endpoint to curb spam.
 *
 * Note: These are in-memory limiters, suitable for a single API instance.
 * For multiple instances, back these with Redis via `rate-limit-redis`.
 *
 * Exports:
 *   - apiLimiter: general API rate limiter
 *   - authLimiter: strict rate limiter for auth endpoints
 *   - publicWriteLimiter: rate limiter for public write endpoints
 */

import rateLimit from "express-rate-limit";

/**
 * In-memory limiters. Fine for a single API instance (the compose setup runs
 * one). For multiple instances, back these with Redis via `rate-limit-redis`.
 */

/** General API rate limiter: 600 requests per 15 minutes per IP. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

/**
 * Strict limiter for credential endpoints — slows brute-force attempts.
 * Successful requests (status < 400) don't count against the limit,
 * so legitimate users aren't penalized for occasional typos.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, please try again later." },
});

/** Limits the public inquiry form to curb spam: 5 requests per 10 minutes per IP. */
export const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later." },
});
