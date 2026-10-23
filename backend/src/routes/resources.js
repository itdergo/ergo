import { Router } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { resources, insertResourceSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";
const router = Router();
router.get("/", cachePublic(120), async (_req, res) => {
  try {
    const result = await db.query.resources.findMany({
      where: and(eq(resources.isActive, true), isNull(resources.deletedAt)),
      orderBy: [desc(resources.orderIndex)]
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});
router.get("/:id", cachePublic(120), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query.resources.findFirst({
      where: and(eq(resources.id, id), isNull(resources.deletedAt))
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
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
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
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = insertResourceSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const result = await db.update(resources).set({ ...parsed.data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(resources.id, id)).returning();
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
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.update(resources).set({ deletedAt: /* @__PURE__ */ new Date() }).where(and(eq(resources.id, id), isNull(resources.deletedAt))).returning();
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
var stdin_default = router;
export {
  stdin_default as default
};
