import { defineConfig } from "vitest/config";
var stdin_default = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.js"],
    env: {
      JWT_SECRET: "test-secret-key-for-vitest-unit-tests",
      REDIS_URL: "redis://localhost:6379"
    }
  }
});
export {
  stdin_default as default
};
