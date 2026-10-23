import { Router } from "express";
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
router.post("/login", authLimiter, noStore, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await db.query.users.findFirst({
      where: eq(users.email, String(email).toLowerCase().trim()),
    });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    let valid = await verifyPassword(password, user.passwordHash);
    if (!valid && isLegacyHash(user.passwordHash)) {
      valid = verifyLegacyPassword(password, user.passwordHash);
      if (valid) {
        const upgraded = await hashPassword(password);
        await db
          .update(users)
          .set({ passwordHash: upgraded, updatedAt: /* @__PURE__ */ new Date() })
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
router.post("/register", requireAuth, requireRole("admin"), noStore, async (req, res) => {
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
});
router.get("/me", requireAuth, noStore, (req, res) => {
  res.json({ user: req.user });
});
var stdin_default = router;
export { stdin_default as default };
