import { Router } from "express";
import { healthCheckResponse } from "@ergo/api-zod";
const router = Router();
router.get("/healthz", (_req, res) => {
  const data = healthCheckResponse.parse({ status: "ok" });
  res.json(data);
});
var stdin_default = router;
export {
  stdin_default as default
};
