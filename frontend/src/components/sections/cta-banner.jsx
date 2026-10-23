import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { KineticHeading, Magnetic } from "@/components/fx";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function CtaBanner() {
  const reduced = useReducedMotion();
  return /* @__PURE__ */ jsx("section", {
    className: "cta-banner",
    children: /* @__PURE__ */ jsx("div", {
      className: "container",
      children: /* @__PURE__ */ jsxs(motion.div, {
        className: "cta-banner-inner",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.6 },
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "cta-banner-content",
            children: [
              /* @__PURE__ */ jsx(KineticHeading, {
                as: "h2",
                text: "Ready to transform your workspace?",
              }),
              /* @__PURE__ */ jsx("p", {
                children:
                  "Get a free consultation and discover how ERGO can elevate your environment.",
              }),
            ],
          }),
          /* @__PURE__ */ jsx(Magnetic, {
            children: /* @__PURE__ */ jsxs(motion.a, {
              className: "button-primary",
              href: "#contact",
              "data-cursor": "view",
              "data-cursor-label": "Consult",
              whileHover: reduced ? void 0 : { scale: 1.04, y: -2 },
              whileTap: { scale: 0.97 },
              transition: { type: "spring", stiffness: 400, damping: 20 },
              children: ["Get a Free Consultation ", /* @__PURE__ */ jsx(ArrowRight, { size: 15 })],
            }),
          }),
        ],
      }),
    }),
  });
}
export { CtaBanner };
