import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
var stdin_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/playwright.config.ts"],
  },
});
export { stdin_default as default };
