/**
 * pages/products.tsx — Products index page.
 *
 * Renders the products listing page with:
 * - PageHero: breadcrumb, title, intro
 * - ProductsSection: full product grid with search/filter
 *
 * SEO: Sets page metadata and injects BreadcrumbList + ItemList
 * structured data for the product listing.
 *
 * The page-focus class suppresses the section's own heading block
 * since PageHero already provides the <h1>.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs, itemList } from "@/lib/structured-data";
import { useSite } from "@/lib/site-context";
import { PageHero } from "@/components/page-hero";
import { ProductsSection } from "@/components/sections/products";

export function ProductsPage() {
  const meta = metaForPath("/products")!;
  const { products } = useSite();

  useSeo({ title: meta.title, description: meta.description, path: "/products" });
  useJsonLd(
    // Structured data: BreadcrumbList + ItemList for product listing
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
    ]),
  );
  useJsonLd(
    "product-list",
    itemList(
      "ERGO product range",
      products.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
    ),
  );

  return (
    <>
      <PageHero
        label="Our Products"
        title="A complete furniture ecosystem."
        intro="From a single ergonomic chair to a fully fitted workplace — seating, desking, systems furniture, storage and space-saving solutions."
        crumb="Products"
      />
      <div className="page-focus">
        <ProductsSection />
      </div>
    </>
  );
}
