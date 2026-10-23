import { defineConfig } from "vitest/config";
var stdin_default = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.js"],
    env: {
      JWT_SECRET: "test-secret-key-for-vitest-unit-tests",
      DATABASE_URL: "postgresql://ergo:ergo@localhost:5432/ergo_contracts",
      REDIS_URL: "redis://localhost:6379",
    },
  },
});
export { stdin_default as default };
