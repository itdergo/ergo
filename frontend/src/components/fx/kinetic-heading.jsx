import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function KineticHeading({ text, as = "h2", className, stagger = 0.085, delay = 0, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const reduced = useReducedMotion();
  const words = text.split(" ").filter(Boolean);
  return /* @__PURE__ */ jsx("div", {
    ref,
    className: "kinetic",
    style: { perspective: 900 },
    children: (() => {
      const Tag = as;
      return /* @__PURE__ */ jsx(Tag, {
        className,
        children: words.map((word, i) =>
          /* @__PURE__ */ jsxs(
            Fragment,
            {
              children: [
                i > 0 ? " " : null,
                /* @__PURE__ */ jsx(motion.span, {
                  className: "kinetic-unit",
                  initial: reduced
                    ? false
                    : { opacity: 0, y: 26, rotateX: -58, filter: "blur(5px)" },
                  animate:
                    reduced || inView
                      ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
                      : { opacity: 0 },
                  transition: {
                    duration: 0.72,
                    delay: delay + i * stagger,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  children: word,
                }),
              ],
            },
            `${word}-${i}`,
          ),
        ),
      });
    })(),
  });
}
export { KineticHeading };
