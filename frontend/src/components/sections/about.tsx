/**
 * components/sections/about.tsx — Company about section.
 *
 * Displays company information in a two-column layout:
 * - Left: label, heading, description paragraphs, link to industries
 * - Right: "ERGO at a glance" card with key stats (30+ years, German
 *   technology, Philippines + SEA reach, BIFMA standards) and showroom image
 *
 * Wrapped in ScrollReveal for scroll-triggered entrance animation.
 * Uses responsive WebP images with srcSet for the showroom photo.
 */
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <ScrollReveal>
      <section className="section section-muted" id="about">
        <div className="container about-grid">
          <div>
            <span className="section-label">About ERGO</span>
            <h2 className="section-heading">Designed Around the Way You Work</h2>
            <p className="section-intro">
              For nearly 30 years, Ergo Contracts Philippines, Inc. has delivered high-performance
              architectural and interior solutions across the Philippines and Southeast Asia.
            </p>
            <p className="body-copy">
              Today we design, manufacture, and deliver seating, systems furniture, desking,
              storage, compactors, and space-saving solutions for offices, institutions, and homes.
            </p>
            <a className="text-link" href="#projects">
              Explore the industries we serve <ArrowRight size={15} />
            </a>
          </div>
          <aside className="about-facts">
            <span className="section-label">ERGO at a glance</span>
            <h3 className="about-facts-heading">
              A workplace partner with experience across the region.
            </h3>
            <div className="stats about-stats">
              <div className="stat">
                <strong>30+</strong>
                <span>Years of expertise</span>
              </div>
              <div className="stat">
                <strong>German</strong>
                <span>Seating technology heritage</span>
              </div>
              <div className="stat">
                <strong>Philippines + SEA</strong>
                <span>Regional experience and reach</span>
              </div>
              <div className="stat">
                <strong>BIFMA</strong>
                <span>Aligned standards</span>
              </div>
            </div>
            <picture>
              <source
                srcSet={srcSet("about-showroom.jpg")}
                type="image/webp"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <img
                className="about-image"
                src={asset("about-showroom.jpg")}
                alt="ErgoHome Showroom"
                width={1448}
                height={1086}
                loading="eager"
                decoding="async"
              />
            </picture>
          </aside>
        </div>
      </section>
    </ScrollReveal>
  );
}
