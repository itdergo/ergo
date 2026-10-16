/**
 * pages/home.tsx — Home page (landing page).
 *
 * Composes all landing page sections in order:
 *   Hero → About → Products → Solutions → Industries → Projects →
 *   Partners → Testimonials → FAQ → CTA Banner → Contact
 *
 * SEO: Sets page title, description, and injects JSON-LD structured data
 * for Organization, LocalBusiness, and WebSite schemas.
 *
 * Data: All section data is fetched by SiteProvider context (products,
 * categories, industries, solutions, resources).
 */
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { ORGANIZATION, LOCAL_BUSINESS, WEBSITE } from "@/lib/structured-data";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProductsSection } from "@/components/sections/products";
import { SolutionsSection } from "@/components/sections/solutions";
import { IndustriesSection } from "@/components/sections/industries";
import { ProjectsSection } from "@/components/sections/projects";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PartnersSection } from "@/components/sections/partners";
import { FaqSection } from "@/components/sections/faq";
import { CtaBanner } from "@/components/sections/cta-banner";
import { ContactSection } from "@/components/sections/contact";

export function HomePage() {
  const meta = metaForPath("/")!;
  // SEO: look up route metadata and apply to <head>
  useSeo({ title: meta.title, description: meta.description, path: "/" });
  useJsonLd("organization", ORGANIZATION);
  // Structured data: Organization, LocalBusiness, WebSite schemas
  useJsonLd("localbusiness", LOCAL_BUSINESS);
  useJsonLd("website", WEBSITE);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <SolutionsSection />
      <IndustriesSection />
      <ProjectsSection />
      <PartnersSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
      <ContactSection />
    </>
  );
}
