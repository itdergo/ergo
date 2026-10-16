/**
 * Prerenders every public route to static HTML so crawlers (and users on slow
 * connections) get real content instead of an empty <div id="root">.
 *
 * Strategy: serve the built dist/public over a tiny local server that also
 * proxies /api to the backend, render each route with headless Chromium
 * (--dump-dom), then write the result to <route>/index.html. nginx's
 * `try_files $uri $uri/ /index.html` serves those files automatically.
 *
 * Requires: a built dist/public, the API reachable, and a Chromium binary.
 * Usage:    node scripts/prerender.mjs
 * Env:      API_URL, CHROME_BIN, PRERENDER_PORT
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

// Promisify execFile for async/await usage with headless Chrome
const execFileAsync = promisify(execFile);

// Configuration from environment variables with sensible defaults
const root = path.resolve(import.meta.dirname, "..");
const distDir = path.join(root, "dist/public");
const API = process.env.API_URL || "http://localhost:5000/api";
const CHROME = process.env.CHROME_BIN || "chromium";
const PORT = Number(process.env.PRERENDER_PORT) || 4178;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Degrade gracefully: a machine without Chromium (e.g. a bare CI runner) should
// still produce a working build, just without prerendered HTML.
function chromeAvailable() {
  try {
    execFileSync(CHROME, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Exit early if Chromium is not available — prerender is optional
if (!chromeAvailable()) {
  console.warn(
    `[prerender] "${CHROME}" not found — skipping prerender. ` +
      "The SPA still works; crawlers just receive the empty shell. " +
      "Set CHROME_BIN to enable prerendering.",
  );
  process.exit(0);
}

// Verify the built SPA shell exists before proceeding
if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error("[prerender] dist/public/index.html not found — run the build first.");
  process.exit(1);
}

// Snapshot the pristine SPA shell. Every HTML request is served this shell —
// falling back to dist/public/index.html would hand a later route the
// *prerendered* home page, leaking its <head> (and its JSON-LD) into every
// other route.
const SHELL = fs.readFileSync(path.join(distDir, "index.html"));

// Load route configuration — same source of truth used by gen-sitemap
const routeConfig = JSON.parse(fs.readFileSync(path.join(root, "src/routes.json"), "utf8"));
const paths = routeConfig.routes.map((r) => r.path);

// Fetch active products to generate prerendered product pages
try {
  const res = await fetch(`${API}/products?status=active&limit=100`, {
    signal: AbortSignal.timeout(5000), // 5 second timeout
  });
  if (res.ok) {
    for (const p of (await res.json()).data ?? []) paths.push(`/products/${p.slug}`);
  }
} catch (err) {
  console.warn(`[prerender] API unreachable (${err.message}); product pages skipped`);
}

// MIME type map for serving static assets with correct content-type
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

// Static file server + /api proxy so the built app behaves like production.
// All routes return the SPA shell (client-side routing handles the rest);
// non-HTML assets are served directly from disk.
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);

  // Proxy API requests to the backend server
  if (url.pathname.startsWith("/api")) {
    try {
      // Strip the /api prefix before forwarding to the backend
      const upstream = await fetch(`${API}${url.pathname.slice(4)}${url.search}`, {
        method: req.method,
        headers: { "content-type": req.headers["content-type"] ?? "application/json" },
      });
      const body = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      });
      res.end(body);
    } catch {
      res.writeHead(502).end('{"error":"proxy failed"}');
    }
    return;
  }

  // Serve the SPA shell for all non-asset requests (client-side routing)
  let filePath = path.join(distDir, url.pathname);
  const ext = path.extname(filePath).toLowerCase();

  // Detect HTML requests: explicit .html, extension-less paths, or directories
  const isHtmlRequest =
    ext === ".html" ||
    ext === "" ||
    (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory());

  if (isHtmlRequest || !fs.existsSync(filePath)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(SHELL);
    return;
  }

  // Serve static assets (JS, CSS, images, etc.) with appropriate MIME type
  res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream" });
  res.end(fs.readFileSync(filePath));
});

// Start the local server and wait for it to be ready
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
console.log(`[prerender] serving dist on ${ORIGIN}`);

/**
 * Render a single route to static HTML using headless Chromium.
 * Uses --virtual-time-budget to allow JavaScript to execute and the SPA to mount.
 * @param {string} p - Route path to render
 * @returns {Promise<string>} The rendered HTML document
 */
async function render(p) {
  const { stdout } = await execFileAsync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox", // Required for running in containers
      "--hide-scrollbars",
      "--virtual-time-budget=9000", // Allow 9s of virtual time for JS to execute
      "--dump-dom", // Output the DOM as serialized HTML
      `${ORIGIN}${p}`,
    ],
    { maxBuffer: 64 * 1024 * 1024 }, // Large buffer for big HTML pages
  );
  return stdout;
}

// Prerender each route and write the result to disk
let written = 0;
for (const p of paths) {
  try {
    const html = await render(p);
    // Skip pages that didn't render (empty document)
    if (!html || !html.includes("</html>")) {
      console.warn(`[prerender] skipped ${p} (empty document)`);
      continue;
    }
    // Write to <route>/index.html so nginx try_files can find it
    const dir = p === "/" ? distDir : path.join(distDir, p);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    written += 1;
    console.log(`[prerender] ${p} → ${(html.length / 1024).toFixed(0)}kb`);
  } catch (err) {
    console.warn(`[prerender] failed ${p}: ${err.message}`);
  }
}

// Clean up the local server
server.close();
console.log(`[prerender] done — ${written}/${paths.length} routes written`);
