/**
 * components/sections/cta-banner.tsx — Call-to-action banner section.
 *
 * Full-width gradient banner with:
 * - Heading: "Ready to transform your workspace?"
 * - Subtext: consultation offer
 * - CTA button: "Start Your Project" linking to contact section
 * - Scroll-triggered entrance animation
 *
 * Visually distinct with green gradient background and white text.
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
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
            <h2>Ready to transform your workspace?</h2>
            <p>Get a free consultation and discover how ERGO can elevate your environment.</p>
          </div>
          <motion.a
            className="button-primary"
            href="#contact"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Start Your Project <ArrowRight size={15} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
