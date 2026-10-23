import { Router } from "express";
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
const router = Router();
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
var stdin_default = router;
export {
  stdin_default as default
};
