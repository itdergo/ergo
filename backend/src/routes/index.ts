/**
 * Route aggregator.
 *
 * Imports all individual route routers and mounts them at their respective
 * paths. This is the single entry point for all API routes.
 *
 * Route mounting:
 *   /          → health router (healthz)
 *   /products  → product routes
 *   /categories → category routes
 *   /inquiries  → inquiry routes
 *   /resources  → resource routes
 *   /industries → industry routes
 *   /solutions  → solution routes
 *   /auth      → authentication routes
 *   /uploads   → file upload routes
 *
 * All routers are mounted under /api by app.ts.
 *
 * Exports:
 *   - router (default): the combined Express Router with all routes
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import inquiriesRouter from "./inquiries";
import resourcesRouter from "./resources";
import industriesRouter from "./industries";
import solutionsRouter from "./solutions";
import authRouter from "./auth";
import uploadsRouter from "./uploads";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/resources", resourcesRouter);
router.use("/industries", industriesRouter);
router.use("/solutions", solutionsRouter);
router.use("/auth", authRouter);
router.use("/uploads", uploadsRouter);
router.use("/ai", aiRouter);

export default router;
