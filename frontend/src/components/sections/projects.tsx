/**
 * components/sections/projects.tsx — Featured projects as a scroll-driven 3D deck.
 *
 * Higgsfield "3D cascading card deck": every project sits in the same grid cell
 * but is pushed out along X, Y and Z. As the section travels through the
 * viewport the focus point walks across the deck, so the cards fan into a
 * cascade in front of you and collapse behind — the depth is driven by scroll
 * position, not by a timer.
 *
 * Reduced motion: ThreeDeck renders the same cards as a plain snap-scrolling
 * row, because a rotating 3D stack is exactly what a reduced-motion visitor
 * asked not to see.
 *
 * Data: projectFolders array from lib/project-data.ts (static data)
 * Images: project images in public/images/projects/
 */
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { projectFolders } from "@/lib/project-data";
import { ArrowRight } from "lucide-react";
import { KineticHeading, ThreeDeck } from "@/components/fx";

/** The deck reads best with an odd number of cards so there is a true centre. */
const DECK_SIZE = 5;

export function ProjectsSection() {
  const deck = projectFolders.slice(0, DECK_SIZE);

  return (
    <ScrollReveal>
      <section className="section section-muted section--sm" id="projects">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Projects</span>
            <KineticHeading
              as="h2"
              className="section-heading section-heading--md"
              text="Featured installations."
            />
            <p className="section-intro">
              A selection of recent ERGO installations across the Philippines — scroll to turn the
              deck.
            </p>
          </div>
          <ThreeDeck
            items={deck.map((p) => (
              <a
                className="project-card"
                href="#contact"
                key={p.name}
                data-cursor="view"
                data-cursor-label="View"
              >
                <div className="project-image">
                  <picture>
                    <source
                      // Manifest-driven so a project photo narrower than 1200px can never
                      // advertise a rung that was not generated (that renders blank).
                      srcSet={srcSet("projects/" + p.image)}
                      type="image/webp"
                      sizes="(max-width: 768px) 60vw, 430px"
                    />
                    <img
                      src={asset("projects/" + p.image)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                  <div className="project-overlay">
                    <span className="project-name">{p.name}</span>
                  </div>
                </div>
              </a>
            ))}
          />
          <a className="text-link section-cta" href="#contact">
            See how we work <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </ScrollReveal>
  );
}
