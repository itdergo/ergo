import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@ergo/database";
import { aiTasks } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { noStore } from "../middlewares/cache";
import { AI_EMPLOYEES } from "../lib/ai-employees";
import { routeTask } from "../lib/ai-router";
const router = Router();
router.get("/employees", noStore, async (_req, res) => {
  try {
    const busy = await db
      .select({ employeeId: aiTasks.employeeId, count: sql`count(*)` })
      .from(aiTasks)
      .where(eq(aiTasks.status, "running"))
      .groupBy(aiTasks.employeeId);
    const busyMap = new Map(busy.map((b) => [b.employeeId, Number(b.count)]));
    const employees = AI_EMPLOYEES.map((e) => ({
      ...e,
      busy: (busyMap.get(e.id) || 0) > 0,
      activeTasks: busyMap.get(e.id) || 0,
    }));
    res.json({ data: employees });
  } catch (error) {
    console.error("Error fetching AI employees:", error);
    res.status(500).json({ error: "Failed to fetch AI employees" });
  }
});
router.get("/tasks", requireAuth, requireRole("admin"), noStore, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const result = await db.query.aiTasks.findMany({
      limit,
      orderBy: [desc(aiTasks.createdAt)],
    });
    res.json({ data: result });
  } catch (error) {
    console.error("Error fetching AI tasks:", error);
    res.status(500).json({ error: "Failed to fetch AI tasks" });
  }
});
router.post("/tasks", requireAuth, requireRole("admin"), noStore, async (req, res) => {
  try {
    const { title, description } = req.body || {};
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const routing = routeTask(title, description || "");
    const [created] = await db
      .insert(aiTasks)
      .values({
        title: title.trim(),
        description: (description || "").trim() || null,
        employeeId: routing.employee.id,
        status: "queued",
      })
      .returning();
    res.status(201).json({ data: created, routing });
  } catch (error) {
    console.error("Error creating AI task:", error);
    res.status(500).json({ error: "Failed to create AI task" });
  }
});
router.patch("/tasks/:id", requireAuth, requireRole("admin"), noStore, async (req, res) => {
  try {
    const id = req.params.id;
    const { status, result } = req.body || {};
    const allowed = ["queued", "running", "done", "failed"];
    if (status && !allowed.includes(status)) {
      res.status(400).json({ error: `status must be one of ${allowed.join(", ")}` });
      return;
    }
    const update = { updatedAt: /* @__PURE__ */ new Date() };
    if (status) update.status = status;
    if (result !== void 0) update.result = result;
    if (status === "done" || status === "failed") update.completedAt = /* @__PURE__ */ new Date();
    const [updated] = await db.update(aiTasks).set(update).where(eq(aiTasks.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ data: updated });
  } catch (error) {
    console.error("Error updating AI task:", error);
    res.status(500).json({ error: "Failed to update AI task" });
  }
});
router.delete("/tasks/:id", requireAuth, requireRole("admin"), noStore, async (req, res) => {
  try {
    const id = req.params.id;
    const [deleted] = await db.delete(aiTasks).where(eq(aiTasks.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ data: deleted });
  } catch (error) {
    console.error("Error deleting AI task:", error);
    res.status(500).json({ error: "Failed to delete AI task" });
  }
});
var stdin_default = router;
export { stdin_default as default };
