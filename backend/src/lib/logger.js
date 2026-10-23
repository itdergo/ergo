import pino from "pino";
const isProduction = process.env.NODE_ENV === "production";
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Redact sensitive headers from all HTTP request/response logs.
  redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
  ...isProduction ? {} : {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  }
});
export {
  logger
};
