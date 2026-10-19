/**
 * lib/types.ts — Shared TypeScript interfaces and asset helpers.
 *
 * Defines the shape of all data models used throughout the application:
 * - Category: product classification (e.g., "Seating", "Desking")
 * - Product: individual furniture item with slug, images, pricing
 * - Industry: target verticals (e.g., "Corporate Offices", "Academe")
 * - Solution: service offerings (e.g., "Space Planning & Design")
 * - Resource: downloadable files (catalogues, specifications)
 * - Inquiry: contact form submissions with status workflow
 *
 * Also provides asset helper functions for generating image URLs with
 * WebP srcSet support for responsive images.
 */
// Shared TypeScript interfaces and asset helpers.
import imageManifest from "./image-manifest.json";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  orderIndex: number;
  isActive: boolean;
}
export interface Product {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  price?: number | null;
  status: string;
  isFeatured: boolean;
  category?: Category;
}
export interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
}
export interface Solution {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  orderIndex: number;
  isActive: boolean;
}
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  orderIndex: number;
  isActive: boolean;
}
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;
// Generate absolute image URL from filename, respecting BASE_URL
export const webpAsset = (file: string) => {
  // Preserve any subdirectory (e.g. "projects/foo.jpg" -> images/webp/projects/foo)
  const dir = file.includes("/") ? `${file.slice(0, file.lastIndexOf("/"))}/` : "";
  const stem = file.slice(file.lastIndexOf("/") + 1).replace(/\.(jpg|jpeg|png)$/i, "");
  return `${import.meta.env.BASE_URL}images/webp/${dir}${stem}`;
};
// Optimized partner-logo WebP set: images/webp/partners/<slug>-400.webp
// (the raw partner PNGs are 0.5-2.3 MB each; slugs keep the filenames URL- and srcSet-safe)
export const webpLogo = (file: string) => {
  const slug = file
    .replace(/\.(jpg|jpeg|png)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${import.meta.env.BASE_URL}images/webp/partners/${slug}-400.webp`;
};
// Generate WebP image path (strips extension, adds .webp)
//
// The rung list comes from scripts/gen-image-manifest.mjs (regenerated on every
// dev/build). This function used to hard-code 400/800/1200/1600 for every image,
// but most sources are narrower than 1600 or only had 400/800/1200 generated — so
// on a wide or high-DPR viewport the browser selected a rung that does not exist
// and the photo rendered blank. The SPA fallback answers a missing file with
// index.html and HTTP 200, so nothing logged an error and the holder just sat empty.
//
// Returns undefined when the image has no WebP rung. Callers can pass that
// straight into <source srcSet={...}> — React drops the attribute and the browser
// skips the sourceless <source>, falling through to the <img> original.
export const srcSet = (file: string): string | undefined => {
  const rungs = (imageManifest as Record<string, number[] | undefined>)[file];
  if (!rungs || rungs.length === 0) return undefined;
  const base = webpAsset(file);
  return rungs.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
};
