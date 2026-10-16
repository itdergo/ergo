import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      JWT_SECRET: "test-secret-key-for-vitest-unit-tests",
      REDIS_URL: "redis://localhost:6379",
    },
  },
});
