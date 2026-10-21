/**
 * vite.config.ts — Vite build configuration.
 *
 * Configures the frontend build with:
 * - React plugin: Fast Refresh and JSX transform
 * - TailwindCSS plugin: Utility-first CSS processing
 * - PWA plugin: Service worker with auto-update, app manifest,
 *   and icon configuration for "ERGO Contracts Philippines"
 * - Path aliases: @/ → src/, @assets/ → attached_assets/
 * - Build output: dist/public/ (served by backend)
 * - Dev server: port 3000, proxies /api to localhost:5000 (backend)
 *
 * Environment variables:
 *   PORT: dev server port (default: 3000)
 *   BASE_PATH: base URL path for deployment (default: "/")
 */
/**
 * Vite configuration for the ERGO Contracts frontend SPA.
 *
 * Configures:
 * - React plugin with automatic JSX runtime
 * - Tailwind CSS v4 via the Vite plugin
 * - PWA manifest and service worker generation (vite-plugin-pwa)
 * - Path aliases (@/ for src, @assets/ for attached_assets)
 * - Dev server proxying /api to the backend on localhost:5000
// Port from env or default 3000; BASE_PATH for subdirectory deployments
 * - Build output to dist/public (served by nginx in production)
 *
 * Environment variables:
 *   PORT     — dev/preview server port (default: 3000)
 *   BASE_PATH — base path for the app (default: /)
 */
import path from "path";
import react from "@vitejs/plugin-react";
// PWA: auto-update service worker, manifest with app name and icons
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

// Dev server and preview server port (can be overridden via env)
const port = Number(process.env.PORT) || 3000;
// Base path for the application (useful for subdirectory deployments)
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    // React Fast Refresh and JSX transform
    react(),
    // Tailwind CSS v4 (no separate config file needed)
    // Path aliases: @/ for src/, @assets/ for attached_assets/
    tailwindcss(),
    // Progressive Web App — generates manifest and service worker
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["images/ergo-logo.jpg"],
      manifest: {
        name: "ERGO Contracts Philippines",
        short_name: "ERGO",
        description: "Ergonomic furniture and workplace solutions",
        theme_color: "#50A014",
        background_color: "#ffffff",
        display: "standalone",
        // Build output to dist/public for backend static serving
        icons: [{ src: "/images/ergo-logo.jpg", sizes: "512x512", type: "image/jpeg" }],
      },
    }),
  ],
  resolve: {
    alias: {
      // @ maps to the src directory for cleaner imports
      "@": path.resolve(import.meta.dirname, "src"),
      // @assets maps to the attached_assets directory (outside src)
      // Dev proxy: /api requests forwarded to backend on port 5000
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
    // Ensure only one copy of React is loaded
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // Output to dist/public — nginx serves this directory in production
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      // Prevent serving files outside the project root
      strict: true,
    },
    proxy: {
      // Proxy API requests to the backend during development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
