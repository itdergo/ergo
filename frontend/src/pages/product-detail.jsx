import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, ArrowRight, Archive } from "lucide-react";
import { api } from "@/lib/api";
import { useSeo, useJsonLd, absoluteUrl } from "@/lib/seo";
import { breadcrumbs, productSchema } from "@/lib/structured-data";
import { asset, srcSet } from "@/lib/types";
function ProductDetailPage({ params }) {
  const slug = params.slug;
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    api
      .getProduct(slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setStatus("ok");
      })
      .catch(() => alive && setStatus("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);
  const title = product
    ? `${product.name} | ERGO Contracts Philippines`
    : "Product | ERGO Contracts Philippines";
  const description =
    product?.shortDescription ||
    product?.description ||
    "ERGO Contracts Philippines product range.";
  useSeo({
    // SEO: product-specific title, description, image
    title,
    description,
    path: `/products/${slug}`,
    image: product?.imageUrl ?? void 0,
    type: "article",
  });
  useJsonLd(
    // Structured data: BreadcrumbList + Product schema
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: product?.name ?? slug, path: `/products/${slug}` },
    ]),
  );
  useJsonLd(
    "product",
    product
      ? productSchema({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          imageUrl: product.imageUrl,
          categoryName: product.category?.name ?? null,
        })
      : {},
  );
  if (status === "loading") {
    return /* @__PURE__ */ jsx("section", {
      className: "section",
      children: /* @__PURE__ */ jsx("div", {
        className: "container",
        children: /* @__PURE__ */ jsx("p", {
          className: "loading-note",
          children: "Loading product\u2026",
        }),
      }),
    });
  }
  if (status === "missing" || !product) {
    return /* @__PURE__ */ jsx("section", {
      className: "section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "container",
        children: [
          /* @__PURE__ */ jsx("h1", {
            className: "section-heading",
            children: "Product not found",
          }),
          /* @__PURE__ */ jsx("p", {
            className: "section-intro",
            children: "We couldn\u2019t find that product. Browse the full range instead.",
          }),
          /* @__PURE__ */ jsxs(Link, {
            className: "button-primary",
            href: "/products",
            children: ["View all products ", /* @__PURE__ */ jsx(ArrowRight, { size: 15 })],
          }),
        ],
      }),
    });
  }
  const photo = product.imageUrl ? product.imageUrl.split("/").pop() : null;
  return /* @__PURE__ */ jsx("section", {
    className: "section",
    children: /* @__PURE__ */ jsxs("div", {
      className: "container",
      children: [
        /* @__PURE__ */ jsxs("nav", {
          className: "breadcrumbs",
          "aria-label": "Breadcrumb",
          children: [
            /* @__PURE__ */ jsx(Link, { href: "/", children: "Home" }),
            /* @__PURE__ */ jsx(ChevronRight, { size: 13, "aria-hidden": "true" }),
            /* @__PURE__ */ jsx(Link, { href: "/products", children: "Products" }),
            /* @__PURE__ */ jsx(ChevronRight, { size: 13, "aria-hidden": "true" }),
            /* @__PURE__ */ jsx("span", { "aria-current": "page", children: product.name }),
          ],
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "product-detail",
          children: [
            /* @__PURE__ */ jsx("div", {
              className: "product-detail-media",
              children: photo
                ? /* @__PURE__ */ jsxs("picture", {
                    children: [
                      /* @__PURE__ */ jsx("source", {
                        srcSet: srcSet(photo),
                        type: "image/webp",
                        sizes: "(max-width: 900px) 100vw, 50vw",
                      }),
                      /* @__PURE__ */ jsx("img", {
                        src: asset(photo),
                        alt: `${product.name} by ERGO Contracts Philippines`,
                        width: 800,
                        height: 600,
                        decoding: "async",
                      }),
                    ],
                  })
                : /* @__PURE__ */ jsx("div", {
                    className: "product-photo-placeholder",
                    children: /* @__PURE__ */ jsxs("div", {
                      className: "product-placeholder-content",
                      children: [
                        /* @__PURE__ */ jsx(Archive, { size: 38, strokeWidth: 1.5 }),
                        /* @__PURE__ */ jsx("span", { children: product.name }),
                      ],
                    }),
                  }),
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "product-detail-body",
              children: [
                product.category &&
                  /* @__PURE__ */ jsx("span", {
                    className: "product-badge",
                    children: product.category.name,
                  }),
                /* @__PURE__ */ jsx("h1", { className: "section-heading", children: product.name }),
                /* @__PURE__ */ jsx("p", {
                  className: "product-detail-desc",
                  children: product.description || product.shortDescription,
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "hero-actions",
                  children: [
                    /* @__PURE__ */ jsxs(Link, {
                      className: "button-primary",
                      href: "/contact",
                      children: ["Request a Quote ", /* @__PURE__ */ jsx(ArrowRight, { size: 15 })],
                    }),
                    /* @__PURE__ */ jsx(Link, {
                      className: "button-secondary",
                      href: "/products",
                      children: "All products",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("p", {
                  className: "product-detail-note",
                  children: [
                    "Need specifications, finishes or dimensions?",
                    " ",
                    /* @__PURE__ */ jsx("a", {
                      href: `mailto:sales_ergo@ergo.com.ph?subject=${encodeURIComponent(`Specification request: ${product.name}`)}`,
                      children: "Email us",
                    }),
                    " ",
                    "or call +63 2 8843 1177.",
                  ],
                }),
                /* @__PURE__ */ jsx("link", {
                  rel: "canonical",
                  href: absoluteUrl(`/products/${product.slug}`),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
export { ProductDetailPage };
