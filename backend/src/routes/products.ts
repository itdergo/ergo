/**
 * Product catalogue routes.
 *
 * Provides CRUD operations for products with filtering, pagination, and
 * caching support.
 *
 * Routes:
 *   GET    /api/products — list products (with optional filters)
 *   GET    /api/products/:slug — get a single product by slug
 *   POST   /api/products — create a product (auth required)
 *   PATCH  /api/products/:id — update a product (auth required)
 *   DELETE /api/products/:id — delete a product (auth required)
 *
 * GET routes are publicly cacheable (cachePublic) with a 60-second TTL.
 * All write operations require authentication.
 *
 * Query parameters for GET /:
 *   - category — filter by category slug
 *   - search — case-insensitive name search
 *   - status — filter by status ("active" | "draft" | "archived")
 *   - featured — "true" to show only featured products
 *   - limit — max results (default 50, max 100)
 *   - offset — pagination offset (default 0)
 *
 * Exports:
 *   - router (default): the Express Router with product routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, ilike, and, sql, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { products, categories, insertProductSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";

const router = Router();

/**
 * GET /api/products — list all products (with optional filters)
 *
 * Supports filtering by category slug, name search, status, and featured flag.
 * Results are paginated and ordered by orderIndex desc, then createdAt desc.
 * Response includes total count for pagination.
 */
// GET /api/products - list all products (with optional filters)
router.get("/", cachePublic(60), async (req: Request, res: Response) => {
  try {
    const { category, search, status, featured, limit, offset } = req.query;
    const conditions = [];

    if (category) {
      conditions.push(eq(categories.slug, category as string));
    }
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(products.status, status as "active" | "draft" | "archived"));
    }
    if (featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }

    conditions.push(isNull(products.deletedAt));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;

    const result = await db.query.products.findMany({
      where: whereClause,
      with: { category: true },
      limit: limitNum,
      offset: offsetNum,
      orderBy: [desc(products.orderIndex), desc(products.createdAt)],
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    res.json({ data: result, total: total[0]?.count || 0, limit: limitNum, offset: offsetNum });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:slug — get a single product by its URL slug.
 * Returns 404 if no product with that slug exists.
 */
// GET /api/products/:slug - get single product
router.get("/:slug", cachePublic(60), async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as Record<string, string>;
    const result = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), isNull(products.deletedAt)),
      with: { category: true },
    });

    if (!result) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * POST /api/products — create a new product.
 * Requires authentication. Validates input with Zod schema.
 */
// POST /api/products - create product
router.post("/", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(products).values(parsed.data).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * PATCH /api/products/:id — update an existing product.
 * Requires authentication. Supports partial updates.
 */
// PATCH /api/products/:id - update product
router.patch("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE /api/products/:id — delete a product by ID.
 * Requires authentication. Returns 404 if the product doesn't exist.
 */
// DELETE /api/products/:id - delete product
router.delete("/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as Record<string, string>;
    const result = await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
