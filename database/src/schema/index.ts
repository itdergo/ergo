/**
 * @file Drizzle ORM schema — defines all PostgreSQL tables, enums, relations, insert schemas, and inferred types.
 *
 * This file is the canonical database schema for the entire ErgoContracts platform.
 * It is consumed by:
 *   - The application server (via `db` in `../index.ts`)
 *   - Drizzle Kit for migration generation (`drizzle.config.ts`)
 *   - drizzle-zod to auto-generate Zod insert schemas used by the API layer
 *
 * ## Table Overview
 * | Table         | Purpose                                              | Key Relationships            |
 * |---------------|------------------------------------------------------|-----------------------------|
 * | users         | Staff/admin accounts                                 | ← inquiries.assignedTo      |
 * | categories    | Product categories (hierarchical top-level)          | → products (1:N)            |
 * | products      | Individual products within a category                | → categories (N:1)          |
 * | inquiries     | Contact form / lead submissions                      | → users (N:1, assignedTo)   |
 * | resources     | Downloadable files (catalogs, brochures, datasheets) | —                           |
 * | industries    | Industry verticals served                            | —                           |
 * | solutions     | Solution offerings presented on the site             | —                           |
 *
 * ## Enums
 * - `user_role` — `admin` | `staff` | `viewer`
 * - `inquiry_status` — `new` | `contacted` | `qualified` | `proposal` | `won` | `lost` | `archived`
 * - `product_status` — `active` | `draft` | `archived`
 *
 * ## Type Exports
 * Each table exports two inferred types:
 * - `TableName` — the full row shape (including all columns, generated fields)
 * - `NewTableName` — the insert shape derived from the Zod schema (excludes server-managed fields)
 */
import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ────────────────────────────────────────────────────────────────────────────
// PostgreSQL Enums
// ────────────────────────────────────────────────────────────────────────────

/** Role-based access control for staff users. */
export const userRoleEnum = pgEnum("user_role", ["admin", "staff", "viewer"]);

/** Pipeline status for customer inquiries/leads. */
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
]);

/** Lifecycle status for products in the catalog. */
export const productStatusEnum = pgEnum("product_status", ["active", "draft", "archived"]);

// ────────────────────────────────────────────────────────────────────────────
// Users Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Staff and administrator accounts.
 * Passwords are stored as hashes (never plaintext) in `password_hash`.
 * `is_active` allows soft-deleting users without losing referential integrity.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("viewer").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Categories Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Top-level product categories. Products reference these via a nullable FK
 * (`onDelete: "set null"`) so deleting a category does not cascade-delete
 * products — they simply become uncategorised.
 * `orderIndex` controls display order on the site (lower = earlier).
 */
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Products Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Individual products belonging to a category.
 * `galleryImages` and `specifications` use JSONB for flexible, schema-less data
 * (arrays of image URL strings, and key-value spec pairs respectively).
 * `isFeatured` flags products for prominent display on the site homepage.
 */
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable FK to categories — set null on category delete to preserve products
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  imageUrl: text("image_url"),
  // JSONB column typed as string[] — Drizzle's $type<> provides compile-time safety
  galleryImages: jsonb("gallery_images").$type<string[]>().default([]),
  // JSONB column typed as Record<string, string> for flexible spec key-value pairs
  specifications: jsonb("specifications").$type<Record<string, string>>(),
  price: integer("price"),
  status: productStatusEnum("status").default("draft").notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Inquiries Table (Contact Form Submissions)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lead/inquiry submissions from the website contact form.
 * `assignedTo` links to a staff user (nullable — unassigned inquiries are
 * still visible in the admin queue). `source` tracks which form/landing page
 * generated the inquiry (defaults to "website").
 */
export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").default("new").notNull(),
  // Nullable FK to users — set null when assigned user is deleted
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  source: varchar("source", { length: 50 }).default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Resources Table (Catalogs, Brochures, Datasheets)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Downloadable files (PDFs, spec sheets, etc.) displayed on the site.
 * `fileType` stores a MIME type or extension identifier (e.g. "pdf", "xlsx").
 * `orderIndex` controls display order within the resources section.
 */
export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Industries Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Industry verticals the company serves (e.g. "Oil & Gas", "Pharmaceuticals").
 * Used for filtering and display on the website. `icon` stores an icon
 * identifier (e.g. Lucide icon name or emoji).
 */
export const industries = pgTable("industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Solutions Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Solution offerings presented on the website (e.g. "Complete Water Treatment").
 * Similar to industries but represents bundled service/product solutions.
 */
export const solutions = pgTable("solutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Audit Logs Table
// ────────────────────────────────────────────────────────────────────────────

/**
 * Audit trail for tracking create, update, delete, and login actions
 * across the platform. `userId` is null for anonymous/unauthenticated actions.
 * `details` stores arbitrary JSONB context (old values, new values, IP, etc.).
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────────────────────
// AI Workforce Tasks Table
// ────────────────────────────────────────────────────────────────────────────

/** Task assigned to (and executed by) one of the 5 AI employees. The router
 *  picks the employee from the task title+description; `status` tracks the
 *  lifecycle (queued → running → done | failed). */
export const aiTasks = pgTable("ai_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  employeeId: varchar("employee_id", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).default("queued").notNull(),
  result: text("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ────────────────────────────────────────────────────────────────────────────
// Table Relations (for Drizzle's relational query API)
// ────────────────────────────────────────────────────────────────────────────

/** A category has many products. */
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

/** A product belongs to one category (nullable). */
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

/** A user can be assigned many inquiries. */
export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}));

/** An inquiry is assigned to one user (nullable). */
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  assignedTo: one(users, {
    fields: [inquiries.assignedTo],
    references: [users.id],
  }),
}));

// ────────────────────────────────────────────────────────────────────────────
// Zod Insert Schemas (auto-generated via drizzle-zod)
//
// These validate incoming request bodies at the API boundary.
// Server-managed fields (id, timestamps, auto-increment) are omitted so
// clients cannot spoof them.
// ────────────────────────────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true, // Status is managed by the server, not the client
  assignedTo: true, // Assignment is an admin action
  notes: true, // Internal notes are not client-editable
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});
export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

export const insertAiTaskSchema = createInsertSchema(aiTasks).omit({
  id: true,
  employeeId: true, // chosen by the router, not the client
  status: true,
  result: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// ────────────────────────────────────────────────────────────────────────────
// Inferred Types
//
// `TypeName`  = full row shape (all columns, as returned by SELECT)
// `NewTypeName` = insert shape derived from the Zod schema (what clients submit)
// ────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type NewCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type NewProduct = z.infer<typeof insertProductSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = z.infer<typeof insertInquirySchema>;
export type Resource = typeof resources.$inferSelect;
export type NewResource = z.infer<typeof insertResourceSchema>;
export type Industry = typeof industries.$inferSelect;
export type NewIndustry = z.infer<typeof insertIndustrySchema>;
export type Solution = typeof solutions.$inferSelect;
export type NewSolution = z.infer<typeof insertSolutionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AiTask = typeof aiTasks.$inferSelect;
export type NewAiTask = z.infer<typeof insertAiTaskSchema>;
