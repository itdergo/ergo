/**
 * components/sections/projects.tsx — Featured projects grid section.
 *
 * Displays project installation cards in a 5-column grid with:
 * - Project images with WebP srcSet for responsive loading
 * - Gradient overlay with project name
 * - Scroll-triggered entrance animations
 * - Click navigates to contact section
 *
 * Data: projectFolders array from lib/project-data.ts (static data)
 * Images: project images in public/images/projects/
 */
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { projectFolders } from "@/lib/project-data";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function ProjectsSection() {
  return (
    <ScrollReveal>
      <section className="section section-muted section--sm" id="projects">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Projects</span>
            <h2 className="section-heading section-heading--md">Featured installations.</h2>
            <p className="section-intro">
              A selection of recent ERGO installations across the Philippines.
            </p>
          </div>
          <div className="project-grid">
            {projectFolders.map((p, i) => (
              // Motion link: scroll-triggered entrance with stagger delay
              <motion.a
                className="project-card"
                href="#contact"
                key={p.name}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="project-image">
                  <picture>
                    <source
                      // Manifest-driven so a project photo narrower than 1200px can never
                      // advertise a rung that was not generated (that renders blank).
                      srcSet={srcSet("projects/" + p.image)}
                      type="image/webp"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <img
                      src={asset("projects/" + p.image)}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div className="project-overlay">
                    <span className="project-name">{p.name}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
          <a className="text-link section-cta" href="#contact">
            See how we work <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </ScrollReveal>
  );
}
