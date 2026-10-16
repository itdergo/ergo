/**
 * lib/structured-data.ts — JSON-LD structured data generators for SEO.
 *
 * Generates Schema.org-compliant JSON-LD objects for rich search results:
 * - ORGANIZATION: company identity with contact info
 * - LOCAL_BUSINESS: FurnitureStore schema with address, geo, hours (feeds Google Business Profile)
 * - WebSite: enables sitelinks search box
 * - breadcrumbs(): BreadcrumbList schema for navigation trails
 * - itemList(): ItemList schema for product/listing pages
 * - productSchema(): Product schema with brand, image, category
 *
 * These are injected into <head> via the useJsonLd hook from lib/seo.ts.
 */
import { SITE_URL, absoluteUrl } from "./seo";

/** Organization — company identity. */
export const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Ergo Contracts Philippines, Inc.",
  alternateName: "ERGO Contracts",
  url: SITE_URL,
  logo: absoluteUrl("/images/ergo-logo.jpg"),
  description:
    "Ergonomic furniture and workplace solutions for offices, institutions, and homes across the Philippines and Southeast Asia.",
  areaServed: ["PH", "SEA"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: "+63-2-8843-1177",
    email: "sales_ergo@ergo.com.ph",
    availableLanguage: ["en", "fil"],
  },
};

/**
 * LocalBusiness — this is the one that feeds Google Business Profile / Maps
 * rich results. Address, geo and opening hours come from the contact section.
 */
export const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "Ergo Contracts Philippines, Inc.",
  image: absoluteUrl("/images/hero-chairs.jpg"),
  logo: absoluteUrl("/images/ergo-logo.jpg"),
  url: SITE_URL,
  telephone: "+63-2-8843-1177",
  email: "sales_ergo@ergo.com.ph",
  priceRange: "$$",
  currenciesAccepted: "PHP",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2634 Rockefeller St., Brgy. San Isidro",
    addressLocality: "Makati City",
    addressRegion: "Metro Manila",
    postalCode: "1200",
    addressCountry: "PH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 14.5529,
    longitude: 121.0077,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  areaServed: ["Metro Manila", "Philippines", "Southeast Asia"],
};

/** WebSite — enables sitelinks search box. */
export const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "ERGO Contracts Philippines",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-PH",
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  // Generate BreadcrumbList schema from array of {name, path} items
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function itemList(name: string, items: { name: string; path: string }[]) {
  // Generate ItemList schema for product listings
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

export function productSchema(p: {
  // Generate Product schema with optional image and category fields
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription || p.description || undefined,
    ...(p.imageUrl
      ? { image: p.imageUrl.startsWith("http") ? p.imageUrl : absoluteUrl(p.imageUrl) }
      : {}),
    ...(p.categoryName ? { category: p.categoryName } : {}),
    brand: { "@type": "Brand", name: "ERGO Contracts Philippines" },
    url: absoluteUrl(`/products/${p.slug}`),
  };
}
