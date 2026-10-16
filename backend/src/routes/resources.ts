/**
 * Resource routes.
 *
 * Provides CRUD operations for resources (documentation, downloads, guides).
 *
 * Routes:
 *   GET    /api/resources — list all active resources
 *   GET    /api/resources/:id — get a single resource by ID
 *   POST   /api/resources — create a resource (auth required)
 *   PATCH  /api/resources/:id — update a resource (auth required)
 *   DELETE /api/resources/:id — delete a resource (auth required)
 *
 * GET routes are publicly cacheable (cachePublic) with a 120-second TTL.
 * All write operations require authentication.
 *
 * Exports:
 *   - router (default): the Express Router with resource routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { resources, insertResourceSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";

const router = Router();

/**
 * GET /api/resources — list all active resources.
 * Results are ordered by orderIndex desc. Cached for 120 seconds.
 */
// GET /api/resources - list all resources
router.get("/", cachePublic(120), async (_req: Request, res: Response) => {
  try {
    const result = await db.query.resources.findMany({
      where: and(eq(resources.isActive, true), isNull(resources.deletedAt)),
      orderBy: [desc(resources.orderIndex)],
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

/**
 * GET /api/resources/:id — get a single resource by ID.
 * Returns 404 if not found.
 */
// GET /api/resources/:id - get single resource
router.get("/:id", cachePublic(120), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db.query.resources.findFirst({
      where: and(eq(resources.id, id), isNull(resources.deletedAt)),
    });

    if (!result) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

/**
 * POST /api/resources — create a new resource.
 * Requires authentication. Validates input with Zod schema.
 */
// POST /api/resources - create resource
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const parsed = insertResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(resources).values(parsed.data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Failed to create resource" });
  }
});

/**
 * PATCH /api/resources/:id — update an existing resource.
 * Requires authentication. Supports partial updates.
 */
// PATCH /api/resources/:id - update resource
router.patch("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const parsed = insertResourceSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db
      .update(resources)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

/**
 * DELETE /api/resources/:id — delete a resource by ID.
 * Requires authentication. Returns 404 if not found.
 */
// DELETE /api/resources/:id - delete resource
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db
      .update(resources)
      .set({ deletedAt: new Date() })
      .where(and(eq(resources.id, id), isNull(resources.deletedAt)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    res.json({ message: "Resource deleted", id });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

export default router;
