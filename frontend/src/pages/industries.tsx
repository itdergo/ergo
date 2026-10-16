/**
 * pages/industries.tsx — Industries page.
 *
 * Renders the industries page with:
 * - PageHero: breadcrumb, title, intro
 * - IndustriesSection: grid of industry cards
 *
 * SEO: Sets page metadata and injects BreadcrumbList structured data.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { IndustriesSection } from "@/components/sections/industries";

export function IndustriesPage() {
  const meta = metaForPath("/industries")!;
  useSeo({ title: meta.title, description: meta.description, path: "/industries" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Industries", path: "/industries" },
    ]),
  );

  return (
    <>
      <PageHero
        label="Industries"
        title="Built for the spaces you run."
        intro="ERGO furnishes the environments where people learn, work, gather and recover — across the Philippines and Southeast Asia."
        crumb="Industries"
      />
      <div className="page-focus">
        <IndustriesSection />
      </div>
    </>
  );
}
