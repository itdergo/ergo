import { useEffect } from "react";
import routeData from "@/routes.json";
const SITE_URL = routeData.siteUrl;
const DEFAULT_OG_IMAGE = routeData.defaultOgImage;
const ROUTES = routeData.routes;
function absoluteUrl(path) {
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
function applySeo({
  // applySeo: writes all SEO meta tags for the current route
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website"
}) {
  if (typeof document === "undefined") return;
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertLink("canonical", url);
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description
  });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
  upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description
  });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
}
function useSeo(input) {
  useEffect(() => {
    applySeo(input);
  }, [input.title, input.description, input.path, input.image, input.type]);
}
function useJsonLd(id, data) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const scriptId = `jsonld-${id}`;
    let el = document.getElementById(scriptId);
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
  }, [id, JSON.stringify(data)]);
}
function metaForPath(path) {
  return ROUTES.find((r) => r.path === path);
}
export {
  DEFAULT_OG_IMAGE,
  ROUTES,
  SITE_URL,
  absoluteUrl,
  applySeo,
  metaForPath,
  useJsonLd,
  useSeo
};
