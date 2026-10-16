/**
 * Industry routes.
 *
 * Provides CRUD operations for industries (market verticals/sectors).
 *
 * Routes:
 *   GET    /api/industries — list all active industries
 *   POST   /api/industries — create an industry (auth required)
 *   PATCH  /api/industries/:id — update an industry (auth required)
 *   DELETE /api/industries/:id — delete an industry (auth required)
 *
 * GET routes are publicly cacheable (cachePublic) with a 120-second TTL.
 * All write operations require authentication.
 *
 * Exports:
 *   - router (default): the Express Router with industry routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { industries, insertIndustrySchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";

const router = Router();

/**
 * GET /api/industries — list all active industries.
 * Results are ordered by orderIndex desc. Cached for 120 seconds.
 */
// GET /api/industries - list all industries
router.get("/", cachePublic(120), async (_req: Request, res: Response) => {
  try {
    const result = await db.query.industries.findMany({
      where: and(eq(industries.isActive, true), isNull(industries.deletedAt)),
      orderBy: [desc(industries.orderIndex)],
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching industries:", error);
    res.status(500).json({ error: "Failed to fetch industries" });
  }
});

/**
 * POST /api/industries — create a new industry.
 * Requires authentication. Validates input with Zod schema.
 */
// POST /api/industries - create industry
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const parsed = insertIndustrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(industries).values(parsed.data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating industry:", error);
    res.status(500).json({ error: "Failed to create industry" });
  }
});

/**
 * PATCH /api/industries/:id — update an existing industry.
 * Requires authentication. Supports partial updates.
 */
// PATCH /api/industries/:id - update industry
router.patch("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const parsed = insertIndustrySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db
      .update(industries)
      .set(parsed.data)
      .where(eq(industries.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Industry not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating industry:", error);
    res.status(500).json({ error: "Failed to update industry" });
  }
});

/**
 * DELETE /api/industries/:id — delete an industry by ID.
 * Requires authentication. Returns 404 if not found.
 */
// DELETE /api/industries/:id - delete industry
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db
      .update(industries)
      .set({ deletedAt: new Date() })
      .where(and(eq(industries.id, id), isNull(industries.deletedAt)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Industry not found" });
      return;
    }

    res.json({ message: "Industry deleted", id });
  } catch (error) {
    console.error("Error deleting industry:", error);
    res.status(500).json({ error: "Failed to delete industry" });
  }
});

export default router;
