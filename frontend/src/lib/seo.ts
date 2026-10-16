/**
 * lib/seo.ts — SEO metadata and structured data management.
 *
 * Provides utilities for per-route SEO optimization:
 * - applySeo(): writes title, description, canonical, Open Graph, and Twitter Card meta tags
 * - useSeo(): React hook wrapper for applySeo (re-runs on input change)
 * - useJsonLd(): injects/replaces JSON-LD script tags by ID
 * - metaForPath(): looks up route metadata from routes.json
 * - absoluteUrl(): generates absolute URLs from site-relative paths
 *
 * Route metadata is sourced from src/routes.json which also drives
 * the sitemap generator and prerender pass.
 *
 * Usage: useSeo({ title, description: "...", path: "/products" });
 */
import { useEffect } from "react";
import routeData from "@/routes.json";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  changefreq?: string;
  priority?: string;
}

export const SITE_URL: string = routeData.siteUrl;
export const DEFAULT_OG_IMAGE: string = routeData.defaultOgImage;
export const ROUTES: RouteMeta[] = routeData.routes as RouteMeta[];

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  // Upsert helper: finds or creates a meta/link element in <head>
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export interface SeoInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/products". Drives the canonical URL. */
  path: string;
  /** Site-relative or absolute image path. */
  image?: string;
  type?: "website" | "article";
}

/**
 * Writes per-route metadata into <head>. Crawlers that execute JS (and the
 * prerender pass) read the final DOM, so each route ends up with its own
 * title, description, canonical and Open Graph tags.
 */
export function applySeo({
  // applySeo: writes all SEO meta tags for the current route
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: SeoInput): void {
  if (typeof document === "undefined") return;

  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertLink("canonical", url);

  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
  upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });

  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
}

/** React hook wrapper around applySeo. */
export function useSeo(input: SeoInput): void {
  // useSeo: React hook that re-applies SEO when inputs change
  useEffect(() => {
    applySeo(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.title, input.description, input.path, input.image, input.type]);
}

/**
 * Injects (or replaces) a JSON-LD block by id. Used for structured data:
 * Organization, LocalBusiness, WebSite, BreadcrumbList, ItemList, Product.
 */
export function useJsonLd(id: string, data: unknown): void {
  // useJsonLd: injects JSON-LD script tag, replaces if ID exists
  useEffect(() => {
    if (typeof document === "undefined") return;
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = scriptId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [id, JSON.stringify(data)]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Route metadata lookup by exact path. */
export function metaForPath(path: string): RouteMeta | undefined {
  return ROUTES.find((r) => r.path === path);
}
