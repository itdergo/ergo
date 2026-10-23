import { Router } from "express";
import { eq, desc, and, isNull } from "drizzle-orm";
import { db } from "@ergo/database";
import { solutions, insertSolutionSchema } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { cachePublic } from "../middlewares/cache";
const router = Router();
router.get("/", cachePublic(120), async (_req, res) => {
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
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
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
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
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
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(solutions)
      .set({ deletedAt: /* @__PURE__ */ new Date() })
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
var stdin_default = router;
export { stdin_default as default };
