/**
 * Category routes.
 *
 * Provides CRUD operations for product categories.
 *
 * Routes:
 *   GET    /api/categories — list all active categories (with their products)
 *   GET    /api/categories/:slug — get a single category by slug
 *   POST   /api/categories — create a category (auth required)
 *   PATCH  /api/categories/:id — update a category (auth required)
 *   DELETE /api/categories/:id — delete a category (auth required)
 *
 * GET routes are publicly cacheable (cachePublic) with a 120-second TTL.
 * All write operations require authentication.
 *
 * Exports:
 *   - router (default): the Express Router with category routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { categories, insertCategorySchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";

const router = Router();

/**
 * GET /api/categories — list all active categories.
 *
 * Returns categories ordered by orderIndex desc, each with their associated
 * products (id, name, slug, imageUrl only). Cached for 120 seconds.
 */
// GET /api/categories - list all categories
router.get("/", cachePublic(120), async (_req: Request, res: Response) => {
  try {
    const result = await db.query.categories.findMany({
      where: and(eq(categories.isActive, true), isNull(categories.deletedAt)),
      orderBy: [desc(categories.orderIndex)],
      with: {
        products: {
          columns: { id: true, name: true, slug: true, imageUrl: true },
        },
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * GET /api/categories/:slug — get a single category by its URL slug.
 * Returns the category with all its products. 404 if not found.
 */
// GET /api/categories/:slug - get single category
router.get("/:slug", cachePublic(120), async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as Record<string, string>;
    const result = await db.query.categories.findFirst({
      where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
      with: { products: true },
    });

    if (!result) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

/**
 * POST /api/categories — create a new category.
 * Requires authentication. Validates input with Zod schema.
 */
// POST /api/categories - create category
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(categories).values(parsed.data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

/**
 * PATCH /api/categories/:id — update an existing category.
 * Requires authentication. Supports partial updates.
 */
// PATCH /api/categories/:id - update category
router.patch("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const parsed = insertCategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

/**
 * DELETE /api/categories/:id — delete a category by ID.
 * Requires authentication. Returns 404 if not found.
 */
// DELETE /api/categories/:id - delete category
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({ message: "Category deleted", id });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
