/**
 * CSRF protection middleware.
 *
 * Generates a CSRF token on login, stores it in memory, and validates
 * it on mutating routes (POST/PUT/DELETE). Safe methods (GET/HEAD/OPTIONS)
 * are excluded from validation.
 *
 * The client must send the token in the X-CSRF-Token header for all
 * mutating requests.
 *
 * Exports:
 *   - generateCsrfToken: creates a token and stores it in memory
 *   - validateCsrfToken: middleware that validates the token
 *   - removeCsrfToken: removes a token from memory (e.g., on logout)
 */

import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "crypto";

// In-memory CSRF token store: token -> userId
const csrfTokens = new Map<string, string>();

/**
 * Generate a new CSRF token for a user.
 *
 * @param userId - the authenticated user's ID
 * @returns the CSRF token string
 */
export function generateCsrfToken(userId: string): string {
  const token = randomBytes(32).toString("hex");
  csrfTokens.set(token, userId);
  return token;
}

/**
 * Remove a CSRF token from memory.
 *
 * @param token - the token to remove
 */
export function removeCsrfToken(token: string): void {
  csrfTokens.delete(token);
}

/**
 * CSRF validation middleware.
 *
 * Skips validation for safe HTTP methods (GET, HEAD, OPTIONS).
 * For mutating methods, requires a valid X-CSRF-Token header that
 * matches a token stored in memory.
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Skip validation for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const token = req.headers["x-csrf-token"] as string | undefined;
  if (!token) {
    res.status(403).json({ error: "CSRF token missing" });
    return;
  }

  const userId = csrfTokens.get(token);
  if (!userId) {
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }

  // If the request is authenticated, verify the token belongs to the user
  if (req.user && req.user.id !== userId) {
    res.status(403).json({ error: "CSRF token mismatch" });
    return;
  }

  next();
}
