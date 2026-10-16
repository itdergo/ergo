/**
 * Solution routes.
 *
 * Provides CRUD operations for solutions (service offerings/use cases).
 *
 * Routes:
 *   GET    /api/solutions — list all active solutions
 *   POST   /api/solutions — create a solution (auth required)
 *   PATCH  /api/solutions/:id — update a solution (auth required)
 *   DELETE /api/solutions/:id — delete a solution (auth required)
 *
 * GET routes are publicly cacheable (cachePublic) with a 120-second TTL.
 * All write operations require authentication.
 *
 * Exports:
 *   - router (default): the Express Router with solution routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { solutions, insertSolutionSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";

const router = Router();

/**
 * GET /api/solutions — list all active solutions.
 * Results are ordered by orderIndex desc. Cached for 120 seconds.
 */
// GET /api/solutions - list all solutions
router.get("/", cachePublic(120), async (_req: Request, res: Response) => {
  try {
    const result = await db.query.solutions.findMany({
      where: and(eq(solutions.isActive, true), isNull(solutions.deletedAt)),
      orderBy: [desc(solutions.orderIndex)],
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({ error: "Failed to fetch solutions" });
  }
});

/**
 * POST /api/solutions — create a new solution.
 * Requires authentication. Validates input with Zod schema.
 */
// POST /api/solutions - create solution
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const parsed = insertSolutionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(solutions).values(parsed.data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating solution:", error);
    res.status(500).json({ error: "Failed to create solution" });
  }
});

/**
 * PATCH /api/solutions/:id — update an existing solution.
 * Requires authentication. Supports partial updates.
 */
// PATCH /api/solutions/:id - update solution
router.patch("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const parsed = insertSolutionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db
      .update(solutions)
      .set(parsed.data)
      .where(eq(solutions.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Solution not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating solution:", error);
    res.status(500).json({ error: "Failed to update solution" });
  }
});

/**
 * DELETE /api/solutions/:id — delete a solution by ID.
 * Requires authentication. Returns 404 if not found.
 */
// DELETE /api/solutions/:id - delete solution
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db
      .update(solutions)
      .set({ deletedAt: new Date() })
      .where(and(eq(solutions.id, id), isNull(solutions.deletedAt)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Solution not found" });
      return;
    }

    res.json({ message: "Solution deleted", id });
  } catch (error) {
    console.error("Error deleting solution:", error);
    res.status(500).json({ error: "Failed to delete solution" });
  }
});

export default router;
