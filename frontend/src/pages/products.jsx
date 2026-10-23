import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs, itemList } from "@/lib/structured-data";
import { useSite } from "@/lib/site-context";
import { PageHero } from "@/components/page-hero";
import { ProductsSection } from "@/components/sections/products";
function ProductsPage() {
  const meta = metaForPath("/products");
  const { products } = useSite();
  useSeo({ title: meta.title, description: meta.description, path: "/products" });
  useJsonLd(
    // Structured data: BreadcrumbList + ItemList for product listing
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" }
    ])
  );
  useJsonLd(
    "product-list",
    itemList(
      "ERGO product range",
      products.map((p) => ({ name: p.name, path: `/products/${p.slug}` }))
    )
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHero,
      {
        label: "Our Products",
        title: "A complete furniture ecosystem.",
        intro: "From a single ergonomic chair to a fully fitted workplace \u2014 seating, desking, systems furniture, storage and space-saving solutions.",
        crumb: "Products"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "page-focus", children: /* @__PURE__ */ jsx(ProductsSection, {}) })
  ] });
}
export {
  ProductsPage
};
