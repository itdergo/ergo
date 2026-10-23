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
const userRoleEnum = pgEnum("user_role", ["admin", "staff", "viewer"]);
const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
]);
const productStatusEnum = pgEnum("product_status", ["active", "draft", "archived"]);
const users = pgTable("users", {
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
const categories = pgTable("categories", {
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
const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable FK to categories — set null on category delete to preserve products
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  imageUrl: text("image_url"),
  // JSONB column typed as string[] — Drizzle's $type<> provides compile-time safety
  galleryImages: jsonb("gallery_images").$type().default([]),
  // JSONB column typed as Record<string, string> for flexible spec key-value pairs
  specifications: jsonb("specifications").$type(),
  price: integer("price"),
  status: productStatusEnum("status").default("draft").notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
const inquiries = pgTable("inquiries", {
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
const resources = pgTable("resources", {
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
const industries = pgTable("industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
const solutions = pgTable("solutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});
const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
const aiTasks = pgTable("ai_tasks", {
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
const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}));
const inquiriesRelations = relations(inquiries, ({ one }) => ({
  assignedTo: one(users, {
    fields: [inquiries.assignedTo],
    references: [users.id],
  }),
}));
const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  // Status is managed by the server, not the client
  assignedTo: true,
  // Assignment is an admin action
  notes: true,
  // Internal notes are not client-editable
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});
const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});
const insertAiTaskSchema = createInsertSchema(aiTasks).omit({
  id: true,
  employeeId: true,
  // chosen by the router, not the client
  status: true,
  result: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});
export {
  aiTasks,
  auditLogs,
  categories,
  categoriesRelations,
  industries,
  inquiries,
  inquiriesRelations,
  inquiryStatusEnum,
  insertAiTaskSchema,
  insertCategorySchema,
  insertIndustrySchema,
  insertInquirySchema,
  insertProductSchema,
  insertResourceSchema,
  insertSolutionSchema,
  insertUserSchema,
  productStatusEnum,
  products,
  productsRelations,
  resources,
  solutions,
  userRoleEnum,
  users,
  usersRelations,
};
