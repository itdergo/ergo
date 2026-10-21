/**
 * components/sections/about.tsx — Company about section.
 *
 * Displays company information in a two-column layout:
 * - Left: label, heading, description paragraphs, link to industries
 * - Right: "ERGO at a glance" card with key stats (40+ years, German
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
      <section className="section section-muted section--lg" id="about">
        <div className="container about-grid">
          <div>
            <span className="section-label">About ERGO</span>
            <h2 className="section-heading">Designed Around the Way You Work</h2>
            <p className="section-intro">
              For nearly four decades, since 1986, Ergo Contracts Philippines, Inc. has delivered
              high-performance architectural and interior solutions across the Philippines and
              Southeast Asia.
            </p>
            <p className="body-copy">
              Today we design, manufacture, and deliver seating, systems furniture, desking,
              storage, compactors, and space-saving solutions for offices, institutions, and homes.
            </p>
            <a className="text-link luxury-link" href="#projects">
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
                <strong>40+</strong>
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
                loading="lazy"
                decoding="async"
              />
            </picture>
          </aside>
        </div>

        <div className="about-milestones">
          <div className="milestone-header">
            <span className="section-label">Our Journey</span>
            <h3 className="milestone-title">A Legacy of Excellence</h3>
            <p className="section-intro">
              From a single best-selling chair in 1989 to circular manufacturing with ChopValue and
              Zero Carbon PH today — every step of the journey is documented in the timeline below.
            </p>
          </div>
          <div className="milestone-grid">
            <div className="milestone-card">
              <div className="milestone-year">1986</div>
              <div className="milestone-content">
                <h4>Ergo Systems Philippines Founded</h4>
                <p>Beginning our journey in Philippine furniture manufacturing.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">1988</div>
              <div className="milestone-content">
                <h4>Local Manufacturing Begins</h4>
                <p>Established in-house production capabilities.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">1989</div>
              <div className="milestone-content">
                <h4>Del-fin Chair Launch</h4>
                <p>Our best-selling chair becomes a Philippine classic.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">1994</div>
              <div className="milestone-content">
                <h4>Ergo Contracts Philippines Formed</h4>
                <p>Expanded into commercial and institutional solutions.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">2007</div>
              <div className="milestone-content">
                <h4>Ergo Home Launched</h4>
                <p>Entered the residential market with modern living solutions.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">2013</div>
              <div className="milestone-content">
                <h4>Philippine Arena Project</h4>
                <p>Supplied seating for the world&apos;s largest indoor arena.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">2024</div>
              <div className="milestone-content">
                <h4>ChopValue Partnership</h4>
                <p>Circular manufacturing with recycled chopsticks.</p>
              </div>
            </div>
            <div className="milestone-card">
              <div className="milestone-year">2026</div>
              <div className="milestone-content">
                <h4>Zero Carbon PH Initiative</h4>
                <p>Sustainable manufacturing for a greener future.</p>
              </div>
            </div>
          </div>
          <figure className="about-milestones-figure">
            <picture>
              <source
                srcSet={srcSet("milestone-timeline.jpg")}
                type="image/webp"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <img
                className="about-milestones-img"
                src={asset("milestone-timeline.jpg")}
                alt="ERGO company milestones timeline: established 1986, local manufacturing 1988, Del-fin chair 1996, Ergo Home 2007, Philippine Arena 2013, and ChopValue circular manufacturing 2024 to 2026"
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <figcaption>
              ERGO company milestones, 1986 to 2026. Ergo Systems Philippines was established in
              1986; Ergo Contracts Philippines was formed in 1994.
            </figcaption>
          </figure>
        </div>
      </section>
    </ScrollReveal>
  );
}
