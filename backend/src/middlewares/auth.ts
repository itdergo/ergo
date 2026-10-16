/**
 * Authentication middleware.
 *
 * Provides two middleware functions for protecting routes:
 *
 * 1. requireAuth — rejects requests without a valid bearer token.
 *    Extracts the JWT from the Authorization header, verifies it, and attaches
 *    the decoded user to req.user.
 *
 * 2. requireRole — restricts access to specific roles.
 *    Must be used after requireAuth. Returns 403 if the user's role
 *    is not in the allowed list.
 *
 * The Express Request type is augmented with an optional `user` property
 * via global declaration merging.
 *
 * Usage:
 *   router.get("/protected", requireAuth, handler);
 *   router.get("/admin", requireAuth, requireRole("admin"), handler);
 *
 * Exports:
 *   - requireAuth: middleware that requires a valid JWT
 *   - requireRole: middleware factory that restricts to specific roles
 */

import type { Request, Response, NextFunction } from "express";
import { verifyToken, type AuthUser } from "../lib/auth";

// Augment the Express Request interface to include the optional `user` property.
// This declaration merging makes req.user available throughout the app with full type safety.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Extract the bearer token from the Authorization header.
 *
 * Expects the format: "Bearer <token>"
 * Returns null if the header is missing, doesn't start with "Bearer ", or the token is empty.
 *
 * @param req - the Express request
 * @returns the token string, or null if not present
 */
function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Middleware that requires a valid, unexpired bearer token.
 *
 * On success, attaches the decoded AuthUser to req.user and calls next().
 * On failure, returns 401 with an appropriate error message.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = user;
  next();
}

/**
 * Middleware factory that restricts a route to the given roles.
 *
 * Must be used after requireAuth — it relies on req.user being set.
 * Returns 401 if req.user is not set (requireAuth wasn't called first).
 * Returns 403 if the user's role is not in the allowed roles list.
 *
 * @param roles - the roles allowed to access this route
 * @returns middleware function
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
