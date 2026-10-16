/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1280, height: 800 },
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: [
    {
      // Express API. The frontend proxies /api to it, and every data-driven
      // section (products, industries, solutions, nav categories) needs it —
      // without it the Vite proxy returns ECONNREFUSED and the specs see no data.
      // PORT is set here (not job-wide) because vite.config.ts also reads PORT
      // for its own dev-server port, and the two processes need different values.
      command: "npm run dev:api",
      cwd: "..",
      url: "http://localhost:5000/api/healthz",
      env: { ...process.env, PORT: "5000" } as Record<string, string>,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      env: { ...process.env, PORT: "3000" } as Record<string, string>,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
