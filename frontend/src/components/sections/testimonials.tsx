/**
 * components/sections/testimonials.tsx — Client testimonials section.
 *
 * Displays static testimonial cards in a 3-column grid with:
 * - Star rating (5 stars)
 * - Quote icon and testimonial text
 * - Author avatar (initial letter), name, and role
 * - Scroll-triggered entrance animations
 *
 * Data is hardcoded (not from API): 3 testimonials from BPO, Architecture,
 * and University clients.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { Star, Quote, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const testimonials = [
  // Static testimonial data: name, role, text, rating
  {
    name: "Maria Santos",
    role: "Facilities Director, BPO Company",
    text: "ERGO transformed our entire office layout. The ergonomic seating and workstation systems improved employee satisfaction scores by 40%. Their team handled everything from planning to installation.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Architect, JC Design Studio",
    text: "We specify ERGO for every commercial project. Their systems furniture is modular, durable, and the German engineering shows in every detail. Our clients love the quality.",
    rating: 5,
  },
  {
    name: "Dr. Patricia Reyes",
    role: "University Administrator",
    text: "From lecture halls to libraries, ERGO delivered durable, high-traffic seating that looks great and lasts. Their after-sales support has been exceptional.",
    rating: 5,
  },
  {
    name: "Roberto Cruz",
    role: "COO, Tech Startup",
    text: "We furnished our entire 200-seat office in under three weeks. ERGO's team was responsive, professional, and the furniture quality exceeded our expectations. Highly recommended.",
    rating: 5,
  },
  {
    name: "Angela Fernandez",
    role: "Interior Designer, AF Designs",
    text: "The customization options are unmatched. We were able to match exact brand colors and fabrics across multiple product lines. ERGO made our design vision a reality.",
    rating: 5,
  },
  {
    name: "Michael Tan",
    role: "Government Procurement Officer",
    text: "We have been working with ERGO for five years across multiple government facilities. Their consistency in quality and on-time delivery keeps coming back.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const paginate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + visibleCount);

  return (
    <ScrollReveal>
      <section className="section section-muted" id="testimonials">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Testimonials</span>
            <h2 className="section-heading section-heading--md">
              Trusted by leading organizations.
            </h2>
            <p className="section-intro">Hear from the teams who work with ERGO every day.</p>
          </div>
          <div className="testimonial-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                aria-label={`Go to testimonial set ${i + 1}`}
              />
            ))}
          </div>
          <div className="testimonial-carousel">
            <button
              className="testimonial-nav-btn prev"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="testimonial-grid">
              <AnimatePresence mode="popLayout" custom={direction}>
                {visibleTestimonials.map((t, i) => (
                  <motion.div
                    className="testimonial-card"
                    key={t.name}
                    initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    onClick={() => {
                      setDirection(1);
                      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="testimonial-stars">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <Quote size={20} className="testimonial-quote-icon" />
                    <p className="testimonial-text">{t.text}</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.role}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              className="testimonial-nav-btn next"
              onClick={() => paginate(1)}
              aria-label="Next testimonials"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <a className="text-link section-cta" href="#contact">
            Start your project <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </ScrollReveal>
  );
}
