import { jsx, jsxs } from "react/jsx-runtime";
import { asset, srcSet } from "@/lib/types";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef, Fragment } from "react";
import { CountUp, Magnetic } from "@/components/fx";
const containerVariants = {
  // Variant definitions: container stagger + item entrance animations
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 34, rotateX: -6, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.78, ease: [0.25, 0.24, 0.25, 0.99] },
  },
};
const wordVariants = {
  hidden: { opacity: 0, y: 28, rotateX: -10, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: [0.25, 0.24, 0.25, 0.99] },
  },
};
const wordContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.4 },
  },
};
const imageVariants = {
  hidden: { opacity: 0, scale: 0.85, rotateY: 12, x: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    x: 0,
    transition: { duration: 1.1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const CHIPS = [
  { className: "hero-chip-1", lead: "Ergonomic", rest: "Seating" },
  { className: "hero-chip-2", lead: "Systems", rest: "Furniture" },
  { className: "hero-chip-3", lead: "Space", rest: "Planning" },
];
function HeroImage() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 160, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const handleMouseMove = (e) => {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    if (reduced) return;
    mouseX.set(0);
    mouseY.set(0);
  };
  return /* @__PURE__ */ jsxs(motion.div, {
    ref,
    className: "hero-image-wrap",
    variants: imageVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-80px" },
    style: {
      perspective: 1400,
      rotateX: reduced ? 0 : rotateX,
      rotateY: reduced ? 0 : rotateY,
      "--glare-x": springX,
      "--glare-y": springY,
    },
    onMouseMove: reduced ? void 0 : handleMouseMove,
    onMouseLeave: reduced ? void 0 : handleMouseLeave,
    children: [
      /* @__PURE__ */ jsx("div", { className: "hero-image-glow" }),
      /* @__PURE__ */ jsx("div", { className: "hero-image-glare" }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-image-depth",
        style: { transform: "translateZ(60px)" },
        children: /* @__PURE__ */ jsxs("picture", {
          children: [
            /* @__PURE__ */ jsx("source", {
              srcSet: srcSet("hero-chairs.jpg"),
              type: "image/webp",
              sizes: "(max-width: 768px) 100vw, 50vw",
            }),
            /* @__PURE__ */ jsx("img", {
              className: "hero-image",
              src: asset("hero-chairs.jpg"),
              alt: "Contemporary office furnished by ERGO",
              loading: "eager",
              fetchPriority: "high",
              decoding: "async",
            }),
          ],
        }),
      }),
      /* @__PURE__ */ jsx("div", {
        className: "hero-chips",
        children: CHIPS.map((chip) =>
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: `hero-chip ${chip.className}`,
              children: [/* @__PURE__ */ jsx("b", { children: chip.lead }), " ", chip.rest],
            },
            chip.className,
          ),
        ),
      }),
    ],
  });
}
function ScrollIndicator() {
  return /* @__PURE__ */ jsx(motion.div, {
    className: "scroll-indicator",
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay: 2.2, duration: 0.8 },
    children: /* @__PURE__ */ jsx(motion.div, {
      animate: { y: [0, 8, 0] },
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      children: /* @__PURE__ */ jsx(ChevronDown, { size: 18 }),
    }),
  });
}
function HeroSection() {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const spotlightRef = useRef(null);
  const y1 = useTransform(scrollY, [0, 420], [0, -70]);
  const y2 = useTransform(scrollY, [0, 420], [0, -40]);
  const y3 = useTransform(scrollY, [0, 420], [0, -90]);
  const scrubScale = useTransform(scrollY, [0, 420], [1, 0.96]);
  const scrubY = useTransform(scrollY, [0, 420], [0, -24]);
  const opacity = useTransform(scrollY, [0, 340], [1, 0]);
  const vignette = useTransform(scrollY, [0, 360], [0, 0.45]);
  const handleSpotlight = (e) => {
    if (reduced) return;
    const el = spotlightRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - rect.left - 550}px, ${e.clientY - rect.top - 550}px, 0)`;
  };
  const lead = "Spaces That Work.";
  const words = lead.split(" ");
  return /* @__PURE__ */ jsxs("section", {
    className: "hero",
    id: "home",
    onMouseMove: reduced ? void 0 : handleSpotlight,
    children: [
      /* @__PURE__ */ jsx("div", { ref: spotlightRef, className: "hero-spotlight" }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-bg-orb hero-bg-orb-1",
        style: { y: reduced ? 0 : y1 },
      }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-bg-orb hero-bg-orb-2",
        style: { y: reduced ? 0 : y2 },
      }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-bg-orb hero-bg-orb-3",
        style: { y: reduced ? 0 : y3 },
      }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-bg-grid",
        style: { opacity: reduced ? 1 : opacity },
      }),
      /* @__PURE__ */ jsx(motion.div, {
        className: "hero-scanlines",
        style: { opacity: reduced ? 0 : vignette },
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "container hero-grid",
        children: [
          /* @__PURE__ */ jsxs(motion.div, {
            className: "hero-content",
            variants: containerVariants,
            initial: "hidden",
            animate: "visible",
            style: { scale: reduced ? 1 : scrubScale, y: reduced ? 0 : scrubY },
            children: [
              /* @__PURE__ */ jsxs(motion.span, {
                className: "eyebrow",
                variants: itemVariants,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "eyebrow-dot" }),
                  " ERGO Contracts Philippines",
                ],
              }),
              /* @__PURE__ */ jsxs(motion.h1, {
                variants: wordContainer,
                initial: "hidden",
                animate: "visible",
                children: [
                  words.map((word, i) =>
                    /* @__PURE__ */ jsxs(
                      Fragment,
                      {
                        children: [
                          i > 0 ? " " : null,
                          /* @__PURE__ */ jsx(motion.span, {
                            className: "hero-headline-word",
                            variants: wordVariants,
                            style: { display: "inline-block" },
                            children: word,
                          }),
                        ],
                      },
                      word + i,
                    ),
                  ),
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("span", {
                    className: "hero-gradient-text",
                    children: "Furniture That Inspires.",
                  }),
                ],
              }),
              /* @__PURE__ */ jsx(motion.p, {
                className: "hero-copy",
                variants: itemVariants,
                children:
                  "Discover thoughtfully designed furniture and workplace solutions for modern offices, commercial environments, institutions, and homes.",
              }),
              /* @__PURE__ */ jsxs(motion.div, {
                className: "hero-actions",
                variants: itemVariants,
                children: [
                  /* @__PURE__ */ jsx(Magnetic, {
                    children: /* @__PURE__ */ jsxs(motion.a, {
                      className: "button-primary cta-laser",
                      href: "#contact",
                      "data-cursor": "view",
                      "data-cursor-label": "Consult",
                      whileHover: !reduced ? { scale: 1.03, y: -3 } : void 0,
                      whileTap: { scale: 0.96 },
                      transition: { type: "spring", stiffness: 420, damping: 22 },
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "cta-label",
                          children: "Get a Free Consultation",
                        }),
                        /* @__PURE__ */ jsx(ArrowRight, { size: 15 }),
                      ],
                    }),
                  }),
                  /* @__PURE__ */ jsx(Magnetic, {
                    children: /* @__PURE__ */ jsx(motion.a, {
                      className: "button-secondary",
                      href: "#products",
                      whileHover: { scale: 1.03, y: -3, borderColor: "var(--brand)" },
                      whileTap: { scale: 0.96 },
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                      children: "Explore Products",
                    }),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs(motion.div, {
                className: "hero-proof",
                variants: itemVariants,
                children: [
                  /* @__PURE__ */ jsx("span", { children: "German seating technology" }),
                  /* @__PURE__ */ jsx("span", { className: "proof-separator" }),
                  /* @__PURE__ */ jsx("span", { children: "BIFMA-aligned standards" }),
                ],
              }),
              /* @__PURE__ */ jsxs(motion.div, {
                className: "hero-stats",
                variants: itemVariants,
                children: [
                  /* @__PURE__ */ jsxs(motion.div, {
                    className: "hero-stat",
                    whileHover: { y: -4, transition: { duration: 0.2 } },
                    children: [
                      /* @__PURE__ */ jsx("strong", {
                        children: /* @__PURE__ */ jsx(CountUp, { to: 500, suffix: "+" }),
                      }),
                      /* @__PURE__ */ jsx("span", { children: "Projects completed" }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs(motion.div, {
                    className: "hero-stat",
                    whileHover: { y: -4, transition: { duration: 0.2 } },
                    children: [
                      /* @__PURE__ */ jsx("strong", {
                        children: /* @__PURE__ */ jsx(CountUp, { to: 8 }),
                      }),
                      /* @__PURE__ */ jsx("span", { children: "Industries served" }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs(motion.div, {
                    className: "hero-stat",
                    whileHover: { y: -4, transition: { duration: 0.2 } },
                    children: [
                      /* @__PURE__ */ jsx("strong", {
                        children: /* @__PURE__ */ jsx(CountUp, { to: 100, suffix: "+" }),
                      }),
                      /* @__PURE__ */ jsx("span", { children: "Client partners" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsx(HeroImage, {}),
          /* @__PURE__ */ jsx(ScrollIndicator, {}),
        ],
      }),
    ],
  });
}
export { HeroSection };
