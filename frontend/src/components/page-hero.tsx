/**
 * components/page-hero.tsx — Reusable page header for dedicated routes.
 *
 * Provides a consistent header layout for all dedicated pages (products,
 * solutions, industries, projects, contact, resources). Renders:
 * - Breadcrumb navigation (Home → current page) matching BreadcrumbList schema
 * - Section label (small uppercase text)
 * - Page title (<h1> for SEO)
 * - Intro paragraph
 *
 * This component ensures each page has exactly one <h1> for accessibility
 * and SEO, while section components below use <h2>.
 *
 * Props:
 *   label: small uppercase label text
 *   title: main page heading
 *   intro: descriptive paragraph
 *   crumb: current page name for breadcrumb
 */
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

/**
 * Page header for dedicated routes. Supplies the single <h1> for the page
 * (the section components below it carry <h2>s), plus a visible breadcrumb
 * trail that matches the BreadcrumbList structured data.
 */
export function PageHero({
  label,
  title,
  intro,
  crumb,
}: {
  label: string;
  title: string;
  intro: string;
  crumb: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{crumb}</span>
        </nav>
        <span className="section-label">{label}</span>
        <h1 className="section-heading">{title}</h1>
        <p className="section-intro">{intro}</p>
      </div>
    </section>
  );
}
