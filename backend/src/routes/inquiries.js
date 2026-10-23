import { Router } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@ergo/database";
import { inquiries, insertInquirySchema, inquiryStatusEnum } from "@ergo/database";
import { requireAuth, requireRole } from "../middlewares/auth";
import { publicWriteLimiter } from "../middlewares/rateLimit";
import { noStore } from "../middlewares/cache";
import { sendInquiryNotification } from "../lib/email";
const router = Router();
router.get("/", requireAuth, requireRole("admin"), noStore, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const conditions = [];
    const statusValues = inquiryStatusEnum.enumValues;
    if (typeof status === "string" && statusValues.includes(status)) {
      conditions.push(
        eq(inquiries.status, status)
      );
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;
    const result = await db.query.inquiries.findMany({
      where: whereClause,
      limit: limitNum,
      offset: offsetNum,
      orderBy: [desc(inquiries.createdAt)]
    });
    const total = await db.select({ count: sql`count(*)` }).from(inquiries).where(whereClause);
    res.json({ data: result, total: total[0]?.count || 0, limit: limitNum, offset: offsetNum });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});
router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query.inquiries.findFirst({
        where: eq(inquiries.id, id)
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
  }
);
router.post("/", publicWriteLimiter, noStore, async (req, res) => {
  try {
    const parsed = insertInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const result = await db.insert(inquiries).values(parsed.data).returning();
    void sendInquiryNotification(result[0]);
    res.status(201).json({ message: "Inquiry submitted successfully", id: result[0].id });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, notes } = req.body;
      const result = await db.update(inquiries).set({ status, assignedTo, notes, updatedAt: /* @__PURE__ */ new Date() }).where(eq(inquiries.id, id)).returning();
      if (result.length === 0) {
        res.status(404).json({ error: "Inquiry not found" });
        return;
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating inquiry:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  }
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  noStore,
  async (req, res) => {
    try {
      const { id } = req.params;
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
  }
);
var stdin_default = router;
export {
  stdin_default as default
};
