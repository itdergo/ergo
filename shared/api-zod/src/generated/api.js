import * as zod from "zod";
const healthCheckResponse = zod.object({
  status: zod.string()
});
export {
  healthCheckResponse
};
