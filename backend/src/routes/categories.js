import { Router } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { categories, insertCategorySchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";
const router = Router();
router.get("/", cachePublic(120), async (_req, res) => {
  try {
    const result = await db.query.categories.findMany({
      where: and(eq(categories.isActive, true), isNull(categories.deletedAt)),
      orderBy: [desc(categories.orderIndex)],
      with: {
        products: {
          columns: { id: true, name: true, slug: true, imageUrl: true }
        }
      }
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
router.get("/:slug", cachePublic(120), async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.query.categories.findFirst({
      where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
      with: { products: true }
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
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
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
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = insertCategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const result = await db.update(categories).set({ ...parsed.data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(categories.id, id)).returning();
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
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.update(categories).set({ deletedAt: /* @__PURE__ */ new Date() }).where(and(eq(categories.id, id), isNull(categories.deletedAt))).returning();
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
var stdin_default = router;
export {
  stdin_default as default
};
