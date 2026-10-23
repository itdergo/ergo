import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { Star, Quote, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { KineticHeading } from "@/components/fx";
import { useReducedMotion } from "@/lib/site-ui-primitives";
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
function TestimonialsSection() {
  const reduced = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);
  const paginate = (dir) => {
    setDirection(dir);
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
  };
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + visibleCount);
  return /* @__PURE__ */ jsx(ScrollReveal, {
    children: /* @__PURE__ */ jsx("section", {
      className: "section section-muted",
      id: "testimonials",
      children: /* @__PURE__ */ jsxs("div", {
        className: "container",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "section-head",
            children: [
              /* @__PURE__ */ jsx("span", { className: "section-label", children: "Testimonials" }),
              /* @__PURE__ */ jsx(KineticHeading, {
                as: "h2",
                className: "section-heading section-heading--md",
                text: "Trusted by leading organizations.",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "section-intro",
                children: "Hear from the teams who work with ERGO every day.",
              }),
            ],
          }),
          /* @__PURE__ */ jsx("div", {
            className: "testimonial-dots",
            children: Array.from({ length: maxIndex + 1 }).map((_, i) =>
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: `testimonial-dot ${i === currentIndex ? "active" : ""}`,
                  onClick: () => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  },
                  "aria-label": `Go to testimonial set ${i + 1}`,
                },
                i,
              ),
            ),
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "testimonial-carousel",
            children: [
              /* @__PURE__ */ jsx("button", {
                className: "testimonial-nav-btn prev",
                onClick: () => paginate(-1),
                "aria-label": "Previous testimonials",
                children: /* @__PURE__ */ jsx(ChevronLeft, { size: 20 }),
              }),
              /* @__PURE__ */ jsx("div", {
                className: "testimonial-grid",
                children: /* @__PURE__ */ jsx(AnimatePresence, {
                  mode: "popLayout",
                  custom: direction,
                  children: visibleTestimonials.map((t, i) =>
                    /* @__PURE__ */ jsxs(
                      motion.div,
                      {
                        className: "testimonial-card",
                        initial: { opacity: 0, x: direction > 0 ? 50 : -50 },
                        animate: { opacity: 1, x: 0 },
                        exit: { opacity: 0, x: direction > 0 ? -50 : 50 },
                        transition: { duration: 0.4, delay: i * 0.08 },
                        whileHover: reduced
                          ? void 0
                          : { y: -8, rotateX: 3, scale: 1.015, zIndex: 3 },
                        onClick: () => {
                          setDirection(1);
                          setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
                        },
                        style: { cursor: "pointer" },
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className: "testimonial-stars",
                            children: Array.from({ length: t.rating }).map((_, j) =>
                              /* @__PURE__ */ jsx(Star, { size: 14, fill: "currentColor" }, j),
                            ),
                          }),
                          /* @__PURE__ */ jsx(Quote, {
                            size: 20,
                            className: "testimonial-quote-icon",
                          }),
                          /* @__PURE__ */ jsx("p", {
                            className: "testimonial-text",
                            children: t.text,
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className: "testimonial-author",
                            children: [
                              /* @__PURE__ */ jsx("div", {
                                className: "testimonial-avatar",
                                children: t.name.charAt(0),
                              }),
                              /* @__PURE__ */ jsxs("div", {
                                children: [
                                  /* @__PURE__ */ jsx("strong", { children: t.name }),
                                  /* @__PURE__ */ jsx("span", { children: t.role }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      },
                      t.name,
                    ),
                  ),
                }),
              }),
              /* @__PURE__ */ jsx("button", {
                className: "testimonial-nav-btn next",
                onClick: () => paginate(1),
                "aria-label": "Next testimonials",
                children: /* @__PURE__ */ jsx(ChevronRight, { size: 20 }),
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("a", {
            className: "text-link section-cta",
            href: "#contact",
            children: ["Start your project ", /* @__PURE__ */ jsx(ArrowRight, { size: 15 })],
          }),
        ],
      }),
    }),
  });
}
export { TestimonialsSection };
