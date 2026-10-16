/**
 * Health check routes.
 *
 * Provides a simple health probe endpoint for monitoring and load balancers.
 *
 * Routes:
 *   GET /healthz — returns a health check response with status "ok"
 *
 * Exports:
 *   - router (default): the Express Router with health routes
 */

import { Router, type IRouter } from "express";
import { healthCheckResponse } from "@ergo/api-zod";

const router: IRouter = Router();

/**
 * GET /healthz — health check endpoint.
 *
 * Returns a JSON response with the service status. Used by Kubernetes
 * liveness/readiness probes and external monitoring systems.
 */
router.get("/healthz", (_req, res) => {
  const data = healthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
