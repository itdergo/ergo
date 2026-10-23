/**
 * components/sections/hero.tsx — Home page hero section.
 *
 * The most visually complex section, featuring:
 * - Staggered entrance animations (container + item variants)
 * - Kinetic headline: each word swings up on its own stagger
 * - 3D mouse-tracking image tilt (HeroImage component) + specular glare
 * - Cursor spotlight that washes across the hero surface
 * - 3D floating specimen chips (translateZ, so they sit in front of the photo)
 * - Magnetic CTAs that lean toward the pointer
 * - Parallax scrolling background orbs and grid
 * - Scroll-scrubbed scale/fade that hands off to the next chapter
 * - Count-up metrics strip
 *
 * Animation architecture:
 * - containerVariants/itemVariants: staggered fade-in-up for text content
 * - wordVariants/wordContainer: per-word kinetic headline choreography
 * - imageVariants: scale + rotate entrance for the hero image
 * - Mouse tracking: useMotionValue + useSpring + useTransform for 3D tilt
 * - Parallax: scroll-linked transforms for background elements
 *
 * Every pointer/scroll effect is disabled under prefers-reduced-motion.
 *
 * Uses: Framer Motion, lucide-react icons, asset/srcSet helpers, FX layer
 */
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
    transition: { duration: 0.78, ease: [0.25, 0.24, 0.25, 0.99] as const },
  },
};

// Kinetic headline: each word fades up + swings in on its own stagger so the
// headline reads left-to-right in sequence (Higgsfield-style text choreography).
const wordVariants = {
  hidden: { opacity: 0, y: 28, rotateX: -10, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: [0.25, 0.24, 0.25, 0.99] as const },
  },
};
// Parent container for the kinetic headline — staggers the words.
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
    transition: { duration: 1.1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/** Product specimen chips that float in front of the hero photo.
 *  Deliberately NOT the old marketing badges (Premium Quality / German
 *  Technology / 40+ Years) — those were removed. These name what ERGO actually
 *  makes, which is information the page did not have before. */
const CHIPS = [
  { className: "hero-chip-1", lead: "Ergonomic", rest: "Seating" },
  { className: "hero-chip-2", lead: "Systems", rest: "Furniture" },
  { className: "hero-chip-3", lead: "Space", rest: "Planning" },
];

function HeroImage() {
  // HeroImage: 3D tilt effect tracking mouse position (disabled under
  // prefers-reduced-motion for vestibular safety). A second front-layer "glare"
  // pseudo-element simulates specular reflectance, and the depth translateZ
  // pulls the photo forward so the neon background orbs bloom behind it.
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0);
  // Motion values: track normalized mouse position for tilt calculation
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 160, damping: 22 });
  // Spring smoothing: dampen mouse movement for natural feel
  const springY = useSpring(mouseY, { stiffness: 160, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  // Transform: map mouse position to rotation angles
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <motion.div
      ref={ref}
      className="hero-image-wrap"
      variants={imageVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      style={
        {
          perspective: 1400,
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
          "--glare-x": springX,
          "--glare-y": springY,
        } as React.CSSProperties
      }
      onMouseMove={reduced ? undefined : handleMouseMove}
      onMouseLeave={reduced ? undefined : handleMouseLeave}
    >
      <div className="hero-image-glow" />
      <div className="hero-image-glare" />
      <motion.div className="hero-image-depth" style={{ transform: "translateZ(60px)" }}>
        {/* 3D depth: translateZ pulls the photo forward for layered parallax */}
        <picture>
          <source
            srcSet={srcSet("hero-chairs.jpg")}
            type="image/webp"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <img
            className="hero-image"
            src={asset("hero-chairs.jpg")}
            alt="Contemporary office furnished by ERGO"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </motion.div>
      {/* Floating specimen chips: translateZ places each one in a different
          depth plane, so the mouse tilt separates them from the photo. */}
      <div className="hero-chips">
        {CHIPS.map((chip) => (
          <span className={`hero-chip ${chip.className}`} key={chip.className}>
            <b>{chip.lead}</b> {chip.rest}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ScrollIndicator() {
  // ScrollIndicator: animated chevron bouncing to prompt scrolling
  return (
    <motion.div
      className="scroll-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.8 }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown size={18} />
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  // HeroSection: parallax background orbs + grid + cinematic scroll-scrub.
  // As the user scrolls toward the fold, the hero surface gently scales down
  // and translates, the content parallax-fades, and a neon vignette intensifies
  // — a scroll-scrub reveal into the next section (Higgsfield-style).
  // Parallax is disabled under prefers-reduced-motion.
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const y1 = useTransform(scrollY, [0, 420], [0, -70]);
  const y2 = useTransform(scrollY, [0, 420], [0, -40]);
  const y3 = useTransform(scrollY, [0, 420], [0, -90]);
  // Scroll-scrub: scale + fade the entire hero grid as scroll commits to next section
  const scrubScale = useTransform(scrollY, [0, 420], [1, 0.96]);
  const scrubY = useTransform(scrollY, [0, 420], [0, -24]);
  const opacity = useTransform(scrollY, [0, 340], [1, 0]);
  const vignette = useTransform(scrollY, [0, 360], [0, 0.45]);

  // Cursor spotlight: a soft light wash that follows the pointer across the
  // hero. Written straight to the element (not state) so mousemove never
  // re-renders the section.
  const handleSpotlight = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const el = spotlightRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - rect.left - 550}px, ${
      e.clientY - rect.top - 550
    }px, 0)`;
  };

  // Kinetic headline: split the lead phrase into words for staggered entrance
  // choreography; the closing phrase keeps its gradient treatment as-is.
  const lead = "Spaces That Work.";
  const words = lead.split(" ");

  return (
    <section className="hero" id="home" onMouseMove={reduced ? undefined : handleSpotlight}>
      <div ref={spotlightRef} className="hero-spotlight" />
      <motion.div className="hero-bg-orb hero-bg-orb-1" style={{ y: reduced ? 0 : y1 }} />
      <motion.div className="hero-bg-orb hero-bg-orb-2" style={{ y: reduced ? 0 : y2 }} />
      {/* Third neon bloom orb — Higgsfield "electric accent" behind the photo */}
      <motion.div className="hero-bg-orb hero-bg-orb-3" style={{ y: reduced ? 0 : y3 }} />
      <motion.div className="hero-bg-grid" style={{ opacity: reduced ? 1 : opacity }} />
      <motion.div className="hero-scanlines" style={{ opacity: reduced ? 0 : vignette }} />
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ scale: reduced ? 1 : scrubScale, y: reduced ? 0 : scrubY }}
        >
          <motion.span className="eyebrow" variants={itemVariants}>
            <span className="eyebrow-dot" /> ERGO Contracts Philippines
          </motion.span>
          <motion.h1 variants={wordContainer} initial="hidden" animate="visible">
            {words.map((word, i) => (
              <Fragment key={word + i}>
                {i > 0 ? " " : null}
                <motion.span
                  className="hero-headline-word"
                  variants={wordVariants}
                  style={{ display: "inline-block" }}
                >
                  {word}
                </motion.span>
              </Fragment>
            ))}
            <br />
            <span className="hero-gradient-text">Furniture That Inspires.</span>
          </motion.h1>
          <motion.p className="hero-copy" variants={itemVariants}>
            Discover thoughtfully designed furniture and workplace solutions for modern offices,
            commercial environments, institutions, and homes.
          </motion.p>
          <motion.div className="hero-actions" variants={itemVariants}>
            <Magnetic>
              <motion.a
                className="button-primary cta-laser"
                href="#contact"
                data-cursor="view"
                data-cursor-label="Consult"
                whileHover={!reduced ? { scale: 1.03, y: -3 } : undefined}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <span className="cta-label">Get a Free Consultation</span>
                <ArrowRight size={15} />
              </motion.a>
            </Magnetic>
            <Magnetic>
              <motion.a
                className="button-secondary"
                href="#products"
                whileHover={{ scale: 1.03, y: -3, borderColor: "var(--brand)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Explore Products
              </motion.a>
            </Magnetic>
          </motion.div>
          <motion.div className="hero-proof" variants={itemVariants}>
            <span>German seating technology</span>
            <span className="proof-separator" />
            <span>BIFMA-aligned standards</span>
          </motion.div>
          <motion.div className="hero-stats" variants={itemVariants}>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>
                <CountUp to={500} suffix="+" />
              </strong>
              <span>Projects completed</span>
            </motion.div>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>
                <CountUp to={8} />
              </strong>
              <span>Industries served</span>
            </motion.div>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>
                <CountUp to={100} suffix="+" />
              </strong>
              <span>Client partners</span>
            </motion.div>
          </motion.div>
        </motion.div>
        <HeroImage />
        <ScrollIndicator />
      </div>
    </section>
  );
}
