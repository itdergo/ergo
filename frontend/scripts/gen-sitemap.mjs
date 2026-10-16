/**
 * Generates dist/public/sitemap.xml from the single route source of truth
 * (src/routes.json) plus the live product list.
 *
 * Hash URLs (#about, #products) are deliberately NOT emitted — crawlers treat
 * every fragment as the same document, so they are not separate pages.
 *
 * Usage:  node scripts/gen-sitemap.mjs
 * Env:    API_URL (default http://localhost:5000/api)
 */
import fs from 'node:fs';
import path from 'node:path';

// Resolve paths relative to the frontend directory (parent of scripts/)
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'dist/public');
const API = process.env.API_URL || 'http://localhost:5000/api';

// Load route configuration — single source of truth for all site routes
const routeConfig = JSON.parse(
  fs.readFileSync(path.join(root, 'src/routes.json'), 'utf8'),
);
// Strip trailing slash from site URL to avoid double-slash in generated URLs
const siteUrl = routeConfig.siteUrl.replace(/\/$/, '');
// Use today's date as lastmod for all URLs
const today = new Date().toISOString().slice(0, 10);

// Fetch active products from the API to include in the sitemap
let products = [];
try {
  const res = await fetch(`${API}/products?status=active&limit=100`, {
    signal: AbortSignal.timeout(5000), // 5 second timeout to avoid hanging builds
  });
  if (res.ok) products = (await res.json()).data ?? [];
  else console.warn(`[sitemap] API returned ${res.status}; product URLs omitted`);
} catch (err) {
  console.warn(`[sitemap] API unreachable (${err.message}); product URLs omitted`);
}

// Build URL entries from the static route config
const urls = routeConfig.routes.map((r) => ({
  loc: `${siteUrl}${r.path}`,
  lastmod: today,
  changefreq: r.changefreq,
  priority: r.priority,
}));

// Append dynamic product page URLs
for (const p of products) {
  urls.push({
    loc: `${siteUrl}/products/${p.slug}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.6',
  });
}

// Generate the XML sitemap document
const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        '  <url>\n' +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${u.lastmod}</lastmod>\n` +
        (u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : '') +
        (u.priority ? `    <priority>${u.priority}</priority>\n` : '') +
        '  </url>',
    )
    .join('\n') +
  '\n</urlset>\n';

// Write the sitemap to dist/public (create directory if needed)
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
console.log(
  `[sitemap] wrote ${urls.length} URLs (${routeConfig.routes.length} routes + ${products.length} products)`,
);
