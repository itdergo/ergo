import { jsx, jsxs } from "react/jsx-runtime";
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { ArrowRight } from "lucide-react";
import { CountUp, KineticHeading } from "@/components/fx";
function AboutSection() {
  return /* @__PURE__ */ jsx(ScrollReveal, {
    children: /* @__PURE__ */ jsx("section", {
      className: "section section-muted section--lg",
      id: "about",
      children: /* @__PURE__ */ jsxs("div", {
        className: "container about-grid",
        children: [
          /* @__PURE__ */ jsxs("div", {
            children: [
              /* @__PURE__ */ jsx("span", { className: "section-label", children: "About ERGO" }),
              /* @__PURE__ */ jsx(KineticHeading, {
                as: "h2",
                className: "section-heading",
                text: "Designed Around the Way You Work",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "section-intro",
                children:
                  "For nearly four decades, since 1986, Ergo Contracts Philippines, Inc. has delivered high-performance architectural and interior solutions across the Philippines and Southeast Asia.",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "body-copy",
                children:
                  "Today we design, manufacture, and deliver seating, systems furniture, desking, storage, compactors, and space-saving solutions for offices, institutions, and homes.",
              }),
              /* @__PURE__ */ jsxs("a", {
                className: "text-link luxury-link",
                href: "#projects",
                children: [
                  "Explore the industries we serve ",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 15 }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("aside", {
            className: "about-facts",
            children: [
              /* @__PURE__ */ jsx("span", {
                className: "section-label",
                children: "ERGO at a glance",
              }),
              /* @__PURE__ */ jsx("h3", {
                className: "about-facts-heading",
                children: "A workplace partner with experience across the region.",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "stats about-stats",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "stat",
                    children: [
                      /* @__PURE__ */ jsx("strong", {
                        children: /* @__PURE__ */ jsx(CountUp, { to: 40, suffix: "+" }),
                      }),
                      /* @__PURE__ */ jsx("span", { children: "Years of expertise" }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "stat",
                    children: [
                      /* @__PURE__ */ jsx("strong", { children: "German" }),
                      /* @__PURE__ */ jsx("span", { children: "Seating technology heritage" }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "stat",
                    children: [
                      /* @__PURE__ */ jsx("strong", { children: "Philippines + SEA" }),
                      /* @__PURE__ */ jsx("span", { children: "Regional experience and reach" }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "stat",
                    children: [
                      /* @__PURE__ */ jsx("strong", { children: "BIFMA" }),
                      /* @__PURE__ */ jsx("span", { children: "Aligned standards" }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "about-figure",
                children: /* @__PURE__ */ jsxs("picture", {
                  children: [
                    /* @__PURE__ */ jsx("source", {
                      srcSet: srcSet("about-showroom.jpg"),
                      type: "image/webp",
                      sizes: "(max-width: 768px) 100vw, 50vw",
                    }),
                    /* @__PURE__ */ jsx("img", {
                      className: "about-image",
                      src: asset("about-showroom.jpg"),
                      alt: "ErgoHome Showroom",
                      width: 1448,
                      height: 1086,
                      loading: "lazy",
                      decoding: "async",
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
export { AboutSection };
