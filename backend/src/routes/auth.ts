/**
 * Authentication routes.
 *
 * Handles user authentication and account management:
 *
 *   POST /api/auth/login — authenticate with email/password, returns JWT
 *   POST /api/auth/register — create a new user account (admin only)
 *   GET  /api/auth/me — return the currently authenticated user
 *
 * The login endpoint uses authLimiter to prevent brute-force attacks and
 * noStore to prevent caching of auth responses.
 *
 * Security notes:
 *   - Returns the same "Invalid credentials" message for both "no such user"
 *     and "wrong password" to prevent user enumeration.
 *   - Legacy SHA-256 password hashes are transparently migrated to scrypt on login.
 *   - Deactivated accounts receive 403 "Account is deactivated".
 *
 * Exports:
 *   - router (default): the Express Router with auth routes
 */

import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@ergo/database";
import { users } from "@ergo/database";
import {
  hashPassword,
  verifyPassword,
  isLegacyHash,
  verifyLegacyPassword,
  signToken,
} from "../lib/auth";
import { requireAuth, requireRole } from "../middlewares/auth";
import { generateCsrfToken } from "../middlewares/csrf";
import { authLimiter } from "../middlewares/rateLimit";
import { noStore } from "../middlewares/cache";

const router = Router();

/**
 * POST /api/auth/login
 *
 * Authenticates a user with email and password. On success, returns a JWT
 * token and the user's profile info. On failure, returns 401.
 *
 * Rate limited to 10 requests per 15 minutes per IP (authLimiter).
 * Response is not cached (noStore).
 */
// POST /api/auth/login
router.post("/login", authLimiter, noStore, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, String(email).toLowerCase().trim()),
    });

    // Same response for "no such user" and "wrong password" — no enumeration.
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    let valid = await verifyPassword(password, user.passwordHash);

    // Transparent migration: verify legacy unsalted sha256 once, then rehash.
    if (!valid && isLegacyHash(user.passwordHash)) {
      valid = verifyLegacyPassword(password, user.passwordHash);
      if (valid) {
        // Upgrade the password hash to scrypt for future logins.
        const upgraded = await hashPassword(password);
        await db
          .update(users)
          .set({ passwordHash: upgraded, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    }

    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const csrfToken = generateCsrfToken(user.id);

    res.json({
      token,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/register (admin only)
 *
 * Creates a new user account. Requires authentication and the "admin" role.
 * Passwords must be at least 8 characters. The password is hashed with scrypt
 * before storage.
 */
// POST /api/auth/register — admin only
router.post(
  "/register",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body ?? {};

      if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required" });
        return;
      }

      if (String(password).length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      const normalizedEmail = String(email).toLowerCase().trim();
      const existing = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
      });

      if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      const passwordHash = await hashPassword(String(password));

      const result = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash,
          name,
          role: role || "viewer",
        })
        .returning();

      res.status(201).json({
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        role: result[0].role,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  },
);

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile.
 * Requires a valid bearer token.
 */
// GET /api/auth/me — returns the authenticated user
router.get("/me", requireAuth, noStore, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
