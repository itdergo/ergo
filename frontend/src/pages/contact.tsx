/**
 * pages/contact.tsx — Contact page.
 *
 * Renders the contact page with:
 * - PageHero: breadcrumb, title, intro
 * - ContactSection: contact details, inquiry form, and map
 *
 * SEO: Sets page metadata and injects BreadcrumbList structured data.
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ContactSection } from "@/components/sections/contact";

export function ContactPage() {
  const meta = metaForPath("/contact")!;
  useSeo({ title: meta.title, description: meta.description, path: "/contact" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  );

  return (
    <>
      <PageHero
        label="Contact"
        title="Get a Free Consultation"
        intro="Tell us about your space and requirements. We respond within 24 hours."
        crumb="Contact"
      />
      <div className="page-focus">
        <ContactSection />
      </div>
    </>
  );
}
