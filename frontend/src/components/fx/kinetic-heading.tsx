/**
 * components/fx/kinetic-heading.tsx — Kinetic (staggered) display type.
 *
 * Splits a heading into words and swings each one up out of a slight 3D
 * rotateX with a blur, so the line reads left-to-right instead of appearing as
 * a block. This is the Higgsfield headline mechanic.
 *
 * The words are real text nodes inside the real heading element, separated by
 * real spaces — so `textContent` still reads as the full sentence. That keeps
 * heading-outline navigation and text assertions working; a heading whose words
 * were joined with no whitespace would silently break both.
 */
import { Fragment, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";

interface KineticHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Seconds between each word. */
  stagger?: number;
  /** Seconds before the first word. */
  delay?: number;
  /** Play again when scrolled back out of view. Defaults to once. */
  once?: boolean;
}

export function KineticHeading({
  text,
  as = "h2",
  className,
  stagger = 0.085,
  delay = 0,
  once = true,
}: KineticHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const reduced = useReducedMotion();
  const words = text.split(" ").filter(Boolean);

  return (
    <div ref={ref} className="kinetic" style={{ perspective: 900 }}>
      {/* The heading itself keeps its own tag and class, so `.section-heading`
          typography and any heading-level test still apply unchanged. */}
      {(() => {
        const Tag = as;
        return (
          <Tag className={className}>
            {words.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {i > 0 ? " " : null}
                <motion.span
                  className="kinetic-unit"
                  initial={
                    reduced ? false : { opacity: 0, y: 26, rotateX: -58, filter: "blur(5px)" }
                  }
                  animate={
                    reduced || inView
                      ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
                      : { opacity: 0 }
                  }
                  transition={{
                    duration: 0.72,
                    delay: delay + i * stagger,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </Fragment>
            ))}
          </Tag>
        );
      })()}
    </div>
  );
}
