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
import { asset } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { projectFolders } from "@/lib/project-data";
import { motion } from "framer-motion";

export function ProjectsSection() {
  return (
    <ScrollReveal>
      <section className="section" id="projects">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Projects</span>
            <h2 className="section-heading">Featured installations.</h2>
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
                      // WebP srcSet: manually built responsive image paths for projects
                      srcSet={`${import.meta.env.BASE_URL}images/webp/projects/${p.webp}-400.webp 400w, ${import.meta.env.BASE_URL}images/webp/projects/${p.webp}-800.webp 800w, ${import.meta.env.BASE_URL}images/webp/projects/${p.webp}-1200.webp 1200w`}
                      type="image/webp"
                      sizes="(max-width: 768px) 50vw, 20vw"
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
        </div>
      </section>
    </ScrollReveal>
  );
}
