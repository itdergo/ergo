import { jsx, jsxs } from "react/jsx-runtime";
import { useSite } from "@/lib/site-context";
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { getIcon } from "@/lib/image-maps";
import { solutionImages } from "@/lib/image-maps";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
function SolutionsSection() {
  const { solutions } = useSite();
  return /* @__PURE__ */ jsx(ScrollReveal, {
    children: /* @__PURE__ */ jsx("section", {
      className: "section section-muted",
      id: "solutions",
      children: /* @__PURE__ */ jsxs("div", {
        className: "container",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "section-head",
            children: [
              /* @__PURE__ */ jsx("span", { className: "section-label", children: "Solutions" }),
              /* @__PURE__ */ jsx("h2", {
                className: "section-heading",
                children: "End-to-end workplace solutions.",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "section-intro",
                children:
                  "Beyond furniture, ERGO partners with you through every stage \u2014 from concept to a fully installed, functional space.",
              }),
            ],
          }),
          /* @__PURE__ */ jsx("div", {
            className: "bento",
            children: solutions.map((s, i) => {
              const image = solutionImages[s.title];
              const span = i % 3 === 0 ? "bento-card--wide" : "bento-card--half";
              return /* @__PURE__ */ jsxs(
                motion.article,
                {
                  className: `bento-card ${span}`,
                  initial: { opacity: 0, y: 44, rotateX: -14 },
                  whileInView: { opacity: 1, y: 0, rotateX: 0 },
                  viewport: { once: true, margin: "-40px" },
                  transition: {
                    duration: 0.68,
                    delay: (i % 3) * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className: `bento-card__media${image ? "" : " bento-card__media--empty"}`,
                      children:
                        image &&
                        /* @__PURE__ */ jsxs("picture", {
                          children: [
                            /* @__PURE__ */ jsx("source", {
                              srcSet: srcSet(image),
                              type: "image/webp",
                              sizes: "(max-width: 768px) 100vw, 50vw",
                            }),
                            /* @__PURE__ */ jsx("img", {
                              src: asset(image),
                              alt: s.title,
                              loading: "lazy",
                              decoding: "async",
                            }),
                          ],
                        }),
                    }),
                    /* @__PURE__ */ jsx("div", { className: "bento-card__scrim" }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "bento-card__body",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "bento-card__num",
                          children: String(i + 1).padStart(2, "0"),
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "bento-card__icon",
                          children: getIcon(s.icon, 20),
                        }),
                        /* @__PURE__ */ jsx("h3", {
                          className: "bento-card__title",
                          children: s.title,
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "bento-card__desc",
                          children: s.description,
                        }),
                        /* @__PURE__ */ jsxs("a", {
                          href: "#contact",
                          className: "bento-card__link",
                          children: ["Learn More ", /* @__PURE__ */ jsx(ArrowRight, { size: 13 })],
                        }),
                      ],
                    }),
                  ],
                },
                s.id,
              );
            }),
          }),
        ],
      }),
    }),
  });
}
export { SolutionsSection };
