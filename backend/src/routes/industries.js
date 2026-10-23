import { Router } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { industries, insertIndustrySchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";
const router = Router();
router.get("/", cachePublic(120), async (_req, res) => {
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
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
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
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
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
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(industries)
      .set({ deletedAt: /* @__PURE__ */ new Date() })
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
var stdin_default = router;
export { stdin_default as default };
