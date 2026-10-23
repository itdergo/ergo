/**
 * pages/resources.tsx — Resources & catalogues page.
 *
 * Renders the resources page with:
 * - PageHero: breadcrumb, title, intro
 * - ResourcesSection: grid of downloadable resources
 *
 * SEO: Sets page metadata and injects BreadcrumbList structured data.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ResourcesSection } from "@/components/sections/resources";

export function ResourcesPage() {
  const meta = metaForPath("/resources")!;
  useSeo({ title: meta.title, description: meta.description, path: "/resources" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
    ]),
  );

  return (
    <>
      <PageHero
        label="Resources & Catalog"
        title="Brochures & specifications."
        intro="Download our catalogues and product specifications for seating, desking, systems furniture and storage."
        crumb="Resources"
      />
      <div className="page-focus">
        <ResourcesSection />
      </div>
    </>
  );
}
