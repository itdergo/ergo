/**
 * Inquiry routes.
 *
 * Handles contact form submissions and admin management of inquiries.
 *
 * Routes:
 *   GET    /api/inquiries — list all inquiries (auth required, admin)
 *   GET    /api/inquiries/:id — get a single inquiry (auth required)
 *   POST   /api/inquiries — submit an inquiry (public, rate-limited)
 *   PATCH  /api/inquiries/:id — update inquiry status/notes (auth required)
 *   DELETE /api/inquiries/:id — delete an inquiry (auth required)
 *
 * The public submission endpoint uses publicWriteLimiter to curb spam
 * and noStore to prevent caching of inquiry data.
 * All admin endpoints require authentication and noStore.
 *
 * Query parameters for GET /:
 *   - status — filter by inquiry status
 *   - limit — max results (default 50, max 100)
 *   - offset — pagination offset (default 0)
 *
 * Exports:
 *   - router (default): the Express Router with inquiry routes
 */

import { Router, type Request, type Response } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@ergo/database";
import { inquiries, insertInquirySchema, inquiryStatusEnum } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { publicWriteLimiter } from "../middlewares/rateLimit";
import { noStore } from "../middlewares/cache";
import { sendInquiryNotification } from "../lib/email";

const router = Router();

/**
 * GET /api/inquiries — list all inquiries (admin).
 *
 * Supports filtering by status and pagination. Returns inquiry data
 * with total count. Results are ordered by createdAt desc.
 */
// GET /api/inquiries - list all inquiries (admin)
router.get("/", requireAuth, requireRole("admin"), noStore, async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    const conditions = [];

    const statusValues: readonly string[] = inquiryStatusEnum.enumValues;
    if (typeof status === "string" && statusValues.includes(status)) {
      conditions.push(
        eq(inquiries.status, status as (typeof inquiryStatusEnum.enumValues)[number]),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;

    const result = await db.query.inquiries.findMany({
      where: whereClause,
      limit: limitNum,
      offset: offsetNum,
      orderBy: [desc(inquiries.createdAt)],
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(inquiries)
      .where(whereClause);

    res.json({ data: result, total: total[0]?.count || 0, limit: limitNum, offset: offsetNum });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

/**
 * GET /api/inquiries/:id — get a single inquiry by ID.
 * Requires authentication. Returns 404 if not found.
 */
// GET /api/inquiries/:id - get single inquiry
router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as Record<string, string>;
      const result = await db.query.inquiries.findFirst({
        where: eq(inquiries.id, id),
      });

      if (!result) {
        res.status(404).json({ error: "Inquiry not found" });
        return;
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ error: "Failed to fetch inquiry" });
    }
  },
);

/**
 * POST /api/inquiries — submit an inquiry (public contact form).
 *
 * Rate limited to 5 requests per 10 minutes per IP (publicWriteLimiter).
 * Validates input with Zod schema. Response is not cached.
 */
// POST /api/inquiries - submit inquiry (public contact form)
router.post("/", publicWriteLimiter, noStore, async (req: Request, res: Response) => {
  try {
    const parsed = insertInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await db.insert(inquiries).values(parsed.data).returning();

    // Fire-and-forget email notification (never fails the request)
    void sendInquiryNotification(result[0]);

    res.status(201).json({ message: "Inquiry submitted successfully", id: result[0].id });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

/**
 * PATCH /api/inquiries/:id — update inquiry status/notes (admin).
 *
 * Requires authentication. Allows updating status, assignedTo, and notes.
 */
// PATCH /api/inquiries/:id - update inquiry status/notes (admin)
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as Record<string, string>;
      const { status, assignedTo, notes } = req.body;

      const result = await db
        .update(inquiries)
        .set({ status, assignedTo, notes, updatedAt: new Date() })
        .where(eq(inquiries.id, id))
        .returning();

      if (result.length === 0) {
        res.status(404).json({ error: "Inquiry not found" });
        return;
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating inquiry:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  },
);

/**
 * DELETE /api/inquiries/:id — delete an inquiry by ID.
 * Requires authentication. Returns 404 if not found.
 */
// DELETE /api/inquiries/:id - delete inquiry
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params as Record<string, string>;
      const result = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();

      if (result.length === 0) {
        res.status(404).json({ error: "Inquiry not found" });
        return;
      }

      res.json({ message: "Inquiry deleted", id });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ error: "Failed to delete inquiry" });
    }
  },
);

export default router;
