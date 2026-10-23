import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "wouter";
import { useSite } from "@/lib/site-context";
import { srcSet } from "@/lib/types";
import { TiltCard, ScrollReveal } from "@/lib/site-ui-primitives";
import { Archive, ArrowRight, ArrowUpRight, Heart, Search, Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";
import { KineticHeading } from "@/components/fx";
function ProductsSection() {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    showToast
  } = useSite();
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [wishlist, setWishlist] = useState(/* @__PURE__ */ new Set());
  const openLightbox = (src, alt) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };
  const closeLightbox = () => {
    setLightboxSrc(null);
    setLightboxAlt("");
  };
  return /* @__PURE__ */ jsxs(ScrollReveal, { children: [
    /* @__PURE__ */ jsx("section", { className: "section", id: "products", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsxs("div", { className: "section-head", children: [
        /* @__PURE__ */ jsx("span", { className: "section-label", children: "Our Products" }),
        /* @__PURE__ */ jsx(
          KineticHeading,
          {
            as: "h2",
            className: "section-heading",
            text: "A complete furniture ecosystem."
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "section-intro", children: "From a single ergonomic chair to a fully fitted workplace." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "product-filters", children: [
        /* @__PURE__ */ jsxs("div", { className: "search-box", children: [
          /* @__PURE__ */ jsx(Search, { size: 16 }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              "aria-label": "Search products",
              placeholder: "Search products...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "category-filters", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `filter-btn ${!selectedCategory ? "active" : ""}`,
              onClick: () => setSelectedCategory(null),
              children: "All"
            }
          ),
          categories.map((c) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `filter-btn ${selectedCategory === c.slug ? "active" : ""}`,
              onClick: () => setSelectedCategory(c.slug),
              children: c.name
            },
            c.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "product-grid", children: filteredProducts.map((p) => /* @__PURE__ */ jsxs(
        TiltCard,
        {
          className: "product-card",
          maxTilt: 6,
          children: [
            /* @__PURE__ */ jsxs("div", { className: `product-photo${p.imageUrl ? "" : " product-photo-placeholder"}`, children: [
              p.imageUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("picture", { children: [
                  /* @__PURE__ */ jsx(
                    "source",
                    {
                      srcSet: srcSet(p.imageUrl.split("/").pop()),
                      type: "image/webp",
                      sizes: "(max-width: 768px) 50vw, 33vw"
                    }
                  ),
                  /* @__PURE__ */ jsx("img", { src: p.imageUrl, alt: p.name, loading: "lazy", decoding: "async" })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "product-zoom-btn",
                    "aria-label": `View ${p.name} photo`,
                    onClick: (e) => {
                      e.stopPropagation();
                      openLightbox(p.imageUrl, `${p.name} by ERGO Contracts Philippines`);
                    },
                    children: /* @__PURE__ */ jsx(Maximize2, { size: 16 })
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { className: "product-placeholder-content", children: [
                /* @__PURE__ */ jsx(Archive, { size: 38, strokeWidth: 1.5 }),
                /* @__PURE__ */ jsx("span", { children: p.name })
              ] }),
              p.category && /* @__PURE__ */ jsx("span", { className: "product-badge", children: p.category.name }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: `product-wishlist ${wishlist.has(p.id) ? "active" : ""}`,
                  "aria-label": wishlist.has(p.id) ? "Remove from wishlist" : "Add to wishlist",
                  "aria-pressed": wishlist.has(p.id),
                  onClick: (e) => {
                    e.stopPropagation();
                    const next = new Set(wishlist);
                    if (next.has(p.id)) next.delete(p.id);
                    else next.add(p.id);
                    setWishlist(next);
                    showToast({
                      message: next.has(p.id) ? `${p.name} added to your wishlist` : `${p.name} removed from your wishlist`,
                      type: "success"
                    });
                  },
                  children: /* @__PURE__ */ jsx(Heart, { size: 16 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "product-text", children: [
              /* @__PURE__ */ jsxs("div", { className: "card-title-row", children: [
                /* @__PURE__ */ jsx("h3", { className: "card-title", children: /* @__PURE__ */ jsx(Link, { href: `/products/${p.slug}`, className: "card-title-link", children: p.name }) }),
                /* @__PURE__ */ jsx(ArrowUpRight, { className: "arrow-icon", size: 17, "aria-hidden": "true" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "card-description", children: p.shortDescription || p.description }),
              /* @__PURE__ */ jsxs("div", { className: "product-actions", children: [
                /* @__PURE__ */ jsxs(Link, { href: `/products/${p.slug}`, className: "product-cta", children: [
                  "View Details ",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 13 })
                ] }),
                /* @__PURE__ */ jsx("a", { href: "#contact", className: "product-cta product-cta-quote", children: "Request Quote" })
              ] })
            ] })
          ]
        },
        p.id
      )) }),
      filteredProducts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "products-empty", children: [
        /* @__PURE__ */ jsx("p", { children: "No products match your search." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "button-secondary",
            onClick: () => {
              setSearchQuery("");
              setSelectedCategory(null);
            },
            children: "Clear filters"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("a", { className: "text-link section-cta", href: "/contact", children: [
        "Request a product quote ",
        /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Lightbox, { src: lightboxSrc, alt: lightboxAlt, onClose: closeLightbox })
  ] });
}
export {
  ProductsSection
};
