/**
 * components/sections/solutions.tsx — Workplace solutions grid section.
 *
 * Displays solution cards in a 2-column grid with:
 * - Numbered cards (01, 02, 03, 04) with large background numbers
 * - Solution images from image-maps.ts (mapped by solution title)
 * - Icon, title, description for each solution
 * - "Learn More" link to contact section
 * - Scroll-triggered entrance animations with stagger
 *
 * Data: solutions array from useSite() context (loaded from API)
 * Images: solutionImages mapping from lib/image-maps.ts
 */
import { useSite } from "@/lib/site-context";
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { getIcon } from "@/lib/image-maps";
import { solutionImages } from "@/lib/image-maps";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function SolutionsSection() {
  const { solutions } = useSite();
  return (
    <ScrollReveal>
      <section className="section section-muted" id="solutions">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Solutions</span>
            <h2 className="section-heading">End-to-end workplace solutions.</h2>
            <p className="section-intro">
              Beyond furniture, ERGO partners with you through every stage — from concept to a fully
              installed, functional space.
            </p>
          </div>
          <div className="solution-grid">
            {solutions.map((s, i) => (
              // Motion card: scroll-triggered fade-in with stagger delay
              <motion.div
                className="solution-card"
                key={s.id}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="solution-number">{String(i + 1).padStart(2, "0")}</div>
                {/* Background number: decorative large number with low opacity */}
                {solutionImages[s.title] && (
                  <div className="solution-image">
                    <picture>
                      <source
                        srcSet={srcSet(solutionImages[s.title])}
                        type="image/webp"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <img
                        src={asset(solutionImages[s.title])}
                        alt={s.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </div>
                )}
                <div className="solution-content">
                  <div className="icon-tile">{getIcon(s.icon, 21)}</div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <a href="#contact" className="solution-link">
                    Learn More <ArrowRight size={13} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
