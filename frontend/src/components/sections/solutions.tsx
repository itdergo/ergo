/**
 * components/sections/solutions.tsx — Workplace solutions bento grid.
 *
 * Higgsfield "gapless bento": six columns, cards spanning either a full row or
 * half a row on an alternating rhythm, so the grid reads as a composition
 * rather than a uniform stack. Each card carries a full-bleed photo (or a brand
 * gradient when no photo is mapped), a scrim for legibility, and a 3D hover lift.
 *
 * Motion: scroll-triggered entrance with a per-card stagger, and a rotateX so
 * the cards tip into view rather than merely sliding up.
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
          <div className="bento">
            {solutions.map((s, i) => {
              const image = solutionImages[s.title];
              // Alternating rhythm: every third card takes the full row, the rest
              // pair up two-to-a-row. Derived from the index so it holds at any
              // number of solutions.
              const span = i % 3 === 0 ? "bento-card--wide" : "bento-card--half";
              return (
                <motion.article
                  className={`bento-card ${span}`}
                  key={s.id}
                  initial={{ opacity: 0, y: 44, rotateX: -14 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.68,
                    delay: (i % 3) * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* Full-bleed media. The `--empty` variant paints a brand
                      gradient so a solution with no mapped photo still reads as
                      a designed card instead of white type on white. */}
                  <div className={`bento-card__media${image ? "" : " bento-card__media--empty"}`}>
                    {image && (
                      <picture>
                        <source
                          srcSet={srcSet(image)}
                          type="image/webp"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <img src={asset(image)} alt={s.title} loading="lazy" decoding="async" />
                      </picture>
                    )}
                  </div>
                  <div className="bento-card__scrim" />
                  <div className="bento-card__body">
                    <span className="bento-card__num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="bento-card__icon">{getIcon(s.icon, 20)}</div>
                    <h3 className="bento-card__title">{s.title}</h3>
                    <p className="bento-card__desc">{s.description}</p>
                    <a href="#contact" className="bento-card__link">
                      Learn More <ArrowRight size={13} />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
