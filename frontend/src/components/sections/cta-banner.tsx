/**
 * components/sections/cta-banner.tsx — Call-to-action banner section.
 *
 * Full-width gradient banner with:
 * - Kinetic heading + subtext (the consultation offer)
 * - Magnetic CTA button: "Get a Free Consultation", linking to the contact section
 * - Depth layers: two radial washes behind the content, so the banner reads as
 *   a lit surface rather than a flat fill
 * - Scroll-triggered entrance animation
 *
 * Visually distinct with green gradient background and white text.
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { KineticHeading, Magnetic } from "@/components/fx";
import { useReducedMotion } from "@/lib/site-ui-primitives";

export function CtaBanner() {
  const reduced = useReducedMotion();
  return (
    <section className="cta-banner">
      <div className="container">
        <motion.div
          className="cta-banner-inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-banner-content">
            <KineticHeading as="h2" text="Ready to transform your workspace?" />
            <p>Get a free consultation and discover how ERGO can elevate your environment.</p>
          </div>
          <Magnetic>
            <motion.a
              className="button-primary"
              href="#contact"
              data-cursor="view"
              data-cursor-label="Consult"
              whileHover={reduced ? undefined : { scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Get a Free Consultation <ArrowRight size={15} />
            </motion.a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
