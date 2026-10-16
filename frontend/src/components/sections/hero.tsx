/**
 * components/sections/hero.tsx — Home page hero section.
 *
 * The most visually complex section, featuring:
 * - Staggered entrance animations (container + item variants)
 * - 3D mouse-tracking image tilt (HeroImage component)
 * - Parallax scrolling background orbs and grid
 * - Floating badges ("German Engineering", "BIFMA Standards")
 * - Experience badge (30+ years)
 * - Animated scroll indicator
 * - Responsive image with WebP srcSet
 *
 * Animation architecture:
 * - containerVariants/itemVariants: staggered fade-in-up for text content
 * - imageVariants: scale + rotate entrance for the hero image
 * - badgeVariants: delayed entrance for floating badges
 * - Mouse tracking: useMotionValue + useSpring + useTransform for 3D tilt
 * - Parallax: scroll-linked transforms for background elements
 *
 * Uses: Framer Motion, lucide-react icons, asset/srcSet helpers
 */
import { asset, srcSet } from "@/lib/types";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";

const containerVariants = {
  // Variant definitions: container stagger + item entrance animations
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -8, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] as const },
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

const badgeVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function HeroImage() {
  // HeroImage: 3D tilt effect tracking mouse position
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  // Motion values: track normalized mouse position for tilt calculation
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  // Spring smoothing: dampen mouse movement for natural feel
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  // Transform: map mouse position to rotation angles
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="hero-image-wrap"
      variants={imageVariants}
      style={{ perspective: 1200, rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-image-glow" />
      <motion.div className="hero-image-depth" style={{ transform: "translateZ(40px)" }}>
        {/* 3D depth: translateZ creates layered parallax effect */}
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
          />
        </picture>
      </motion.div>
      <motion.div
        className="experience-badge"
        variants={badgeVariants}
        whileHover={{ scale: 1.06, y: -4, transition: { duration: 0.25 } }}
      >
        <strong>
          30<span>+</span>
        </strong>
        <small>Years of expertise</small>
      </motion.div>
      <motion.div
        className="hero-float-badge hero-float-1"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="float-badge-icon">&#9679;</span>
        <span>German Engineering</span>
      </motion.div>
      <motion.div
        className="hero-float-badge hero-float-2"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
      >
        <span className="float-badge-icon">&#9679;</span>
        <span>BIFMA Standards</span>
      </motion.div>
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
  // HeroSection: parallax background orbs + grid + content layout
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 400], [0, -60]);
  const y2 = useTransform(scrollY, [0, 400], [0, -30]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="hero" id="home">
      <motion.div className="hero-bg-orb hero-bg-orb-1" style={{ y: y1 }} />
      <motion.div className="hero-bg-orb hero-bg-orb-2" style={{ y: y2 }} />
      <motion.div className="hero-bg-grid" style={{ opacity }} />
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="eyebrow" variants={itemVariants}>
            <span className="eyebrow-dot" /> ERGO Contracts Philippines
          </motion.span>
          <motion.h1 variants={itemVariants}>
            Spaces That Work.
            <br />
            <span className="hero-gradient-text">Furniture That Inspires.</span>
          </motion.h1>
          <motion.p className="hero-copy" variants={itemVariants}>
            Discover thoughtfully designed furniture and workplace solutions for modern offices,
            commercial environments, institutions, and homes.
          </motion.p>
          <motion.div className="hero-actions" variants={itemVariants}>
            <motion.a
              className="button-primary"
              href="#contact"
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0 14px 30px rgba(79,143,36,.35)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Get a Free Quote <ArrowRight size={15} />
            </motion.a>
            <motion.a
              className="button-secondary"
              href="#products"
              whileHover={{ scale: 1.03, y: -2, borderColor: "var(--brand)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Explore Products
            </motion.a>
          </motion.div>
          <motion.div className="hero-proof" variants={itemVariants}>
            <span>German seating technology</span>
            <span className="proof-separator" />
            <span>BIFMA-aligned standards</span>
          </motion.div>
          <motion.div className="hero-stats" variants={itemVariants}>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>
                500<span>+</span>
              </strong>
              <span>Projects completed</span>
            </motion.div>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>8</strong>
              <span>Industries served</span>
            </motion.div>
            <motion.div className="hero-stat" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <strong>
                100<span>+</span>
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
