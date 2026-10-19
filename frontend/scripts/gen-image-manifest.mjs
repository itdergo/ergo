/**
 * scripts/gen-image-manifest.mjs — build the WebP availability manifest.
 *
 * src/lib/types.ts srcSet() needs to know which WebP rungs actually exist for an
 * image. It used to assume 400/800/1200/1600 always exist, so on a wide or
 * high-DPR viewport the browser would select a rung that was never generated and
 * the photo rendered blank (the SPA fallback answers missing files with
 * index.html + 200, so there is no error to notice).
 *
 * This scans public/images and records, per source image, the rungs present on
 * disk. Run before dev/build (wired into package.json) so the manifest can never
 * go stale. Dependency-free: JPEG/PNG dimensions are read from the file headers.
 *
 * Usage: node scripts/gen-image-manifest.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGES = join(HERE, "..", "public", "images");
const OUT = join(HERE, "..", "src", "lib", "image-manifest.json");
const RUNGS = [400, 800, 1200, 1600];

/** Read intrinsic width/height from a JPEG or PNG header. Returns null if unknown. */
function dimensions(buf) {
  // PNG: 8-byte signature, then IHDR with width/height as big-endian u32
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk the marker segments to the first SOFn frame header
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) {
        off++;
        continue;
      }
      const marker = buf[off + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        off += 2;
        continue;
      }
      const len = buf.readUInt16BE(off + 2);
      // SOF0..SOF15, excluding DHT (c4), JPG (c8) and DAC (cc)
      const isSOF =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
      }
      off += 2 + len;
    }
  }
  return null;
}

/** Walk public/images, skipping the generated webp/ tree. */
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "webp") continue;
      walk(full, acc);
    } else if (/\.(jpe?g|png)$/i.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

const manifest = {};
let sources = 0;
let rungless = [];

for (const src of walk(IMAGES).sort()) {
  const rel = relative(IMAGES, src).split(sep).join("/");
  // partners/ are served by webpLogo() with slugified -400 names, not by srcSet()
  if (rel.startsWith("partners/")) continue;

  const dims = dimensions(readFileSync(src));
  const stem = rel.replace(/\.(jpe?g|png)$/i, "");
  const available = RUNGS.filter((s) => {
    // a rung must both exist and not be an upscale of the source
    if (dims && s > dims.width) return false;
    return existsSync(join(IMAGES, "webp", `${stem}-${s}.webp`));
  });

  manifest[rel] = available;
  sources++;
  if (available.length === 0) rungless.push(rel);
}

// Emit Prettier-compatible JSON (inline arrays, 2-space indent, trailing newline)
// so the generated file never fails `prettier --check` in CI.
const body = Object.entries(manifest)
  .map(([file, rungs]) => `  ${JSON.stringify(file)}: [${rungs.join(", ")}]`)
  .join(",\n");
writeFileSync(OUT, `{\n${body}\n}\n`, "utf8");

const totalRungs = Object.values(manifest).reduce((n, a) => n + a.length, 0);
console.log(
  `[image-manifest] ${sources} sources, ${totalRungs} webp rungs -> src/lib/image-manifest.json`,
);
if (rungless.length) {
  console.log(
    `[image-manifest] ${rungless.length} source(s) have no webp rung and will use the original:`,
  );
  for (const r of rungless) console.log(`   ${r}`);
}
