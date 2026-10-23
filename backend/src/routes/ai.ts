/**
 * routes/ai.ts — AI Workforce API.
 *
 * Exposes the 5 AI employees and the task queue that drives them.
 *
 * Routes:
 *   GET    /api/ai/employees          — list the 5 employees (public-ish, auth for admin)
 *   GET    /api/ai/tasks              — list tasks (most recent first)
 *   POST   /api/ai/tasks              — create a task; router auto-assigns the employee
 *   PATCH  /api/ai/tasks/:id          — update status / result
 *   DELETE /api/ai/tasks/:id          — remove a task
 *
 * All task endpoints require auth (admin). Employees listing is public so the
 * dashboard can render the roster without a login during demos.
 */
import { Router, type Request, type Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@ergo/database";
import { aiTasks, type AiTask } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { noStore } from "../middlewares/cache";
import { AI_EMPLOYEES, getEmployee } from "../lib/ai-employees";
import { routeTask } from "../lib/ai-router";

const router = Router();

// GET /api/ai/employees — roster with live busy flag
router.get("/employees", noStore, async (_req: Request, res: Response) => {
  try {
    // A employee is "busy" when it has at least one task in `running` state.
    const busy = await db
      .select({ employeeId: aiTasks.employeeId, count: sql<number>`count(*)` })
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

// GET /api/ai/tasks — recent first
router.get(
  "/tasks",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
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
  },
);

// POST /api/ai/tasks — create + auto-route
router.post(
  "/tasks",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
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
  },
);

// PATCH /api/ai/tasks/:id — update status / result
router.patch(
  "/tasks/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status, result } = req.body || {};
      const allowed = ["queued", "running", "done", "failed"];
      if (status && !allowed.includes(status)) {
        res.status(400).json({ error: `status must be one of ${allowed.join(", ")}` });
        return;
      }
      const update: Partial<AiTask> = { updatedAt: new Date() };
      if (status) update.status = status;
      if (result !== undefined) update.result = result;
      if (status === "done" || status === "failed") update.completedAt = new Date();
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
  },
);

// DELETE /api/ai/tasks/:id
router.delete(
  "/tasks/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
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
  },
);

export default router;
