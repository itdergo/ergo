import { Router } from "express";
import { eq, desc, ilike, and, sql, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { products, categories, insertProductSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";
const router = Router();
router.get("/", cachePublic(60), async (req, res) => {
  try {
    const { category, search, status, featured, limit, offset } = req.query;
    const conditions = [];
    if (category) {
      conditions.push(eq(categories.slug, category));
    }
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(products.status, status));
    }
    if (featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }
    conditions.push(isNull(products.deletedAt));
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
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
      .select({ count: sql`count(*)` })
      .from(products)
      .where(whereClause);
    res.json({ data: result, total: total[0]?.count || 0, limit: limitNum, offset: offsetNum });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
router.get("/:slug", cachePublic(60), async (req, res) => {
  try {
    const { slug } = req.params;
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
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
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
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const result = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: /* @__PURE__ */ new Date() })
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
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(products)
      .set({ deletedAt: /* @__PURE__ */ new Date() })
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
var stdin_default = router;
export { stdin_default as default };
