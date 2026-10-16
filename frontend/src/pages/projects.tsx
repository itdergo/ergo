/**
 * pages/projects.tsx — Projects page.
 *
 * Renders the projects page with:
 * - PageHero: breadcrumb, title, intro
 * - ProjectsSection: grid of project installation cards
 *
 * SEO: Sets page metadata and injects BreadcrumbList structured data.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ProjectsSection } from "@/components/sections/projects";

export function ProjectsPage() {
  const meta = metaForPath("/projects")!;
  useSeo({ title: meta.title, description: meta.description, path: "/projects" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
    ]),
  );

  return (
    <>
      <PageHero
        label="Projects"
        title="Featured installations."
        intro="A selection of recent ERGO installations across the Philippines — from corporate headquarters and universities to arenas and government facilities."
        crumb="Projects"
      />
      <div className="page-focus">
        <ProjectsSection />
      </div>
    </>
  );
}
