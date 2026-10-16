/**
 * pages/solutions.tsx — Solutions page.
 *
 * Renders the solutions page with:
 * - PageHero: breadcrumb, title, intro
 * - SolutionsSection: grid of solution cards
 *
 * SEO: Sets page metadata and injects BreadcrumbList structured data.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { SolutionsSection } from "@/components/sections/solutions";

export function SolutionsPage() {
  const meta = metaForPath("/solutions")!;
  useSeo({ title: meta.title, description: meta.description, path: "/solutions" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
    ]),
  );

  return (
    <>
      <PageHero
        label="Solutions"
        title="End-to-end workplace solutions."
        intro="Beyond furniture, ERGO partners with you through every stage — from concept to a fully installed, functional space."
        crumb="Solutions"
      />
      <div className="page-focus">
        <SolutionsSection />
      </div>
    </>
  );
}
