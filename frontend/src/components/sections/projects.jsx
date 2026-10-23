import { jsx, jsxs } from "react/jsx-runtime";
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { projectFolders } from "@/lib/project-data";
import { ArrowRight } from "lucide-react";
import { KineticHeading, ThreeDeck } from "@/components/fx";
const DECK_SIZE = 5;
function ProjectsSection() {
  const deck = projectFolders.slice(0, DECK_SIZE);
  return /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx("section", { className: "section section-muted section--sm", id: "projects", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "section-head", children: [
      /* @__PURE__ */ jsx("span", { className: "section-label", children: "Projects" }),
      /* @__PURE__ */ jsx(
        KineticHeading,
        {
          as: "h2",
          className: "section-heading section-heading--md",
          text: "Featured installations."
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "section-intro", children: "A selection of recent ERGO installations across the Philippines \u2014 scroll to turn the deck." })
    ] }),
    /* @__PURE__ */ jsx(
      ThreeDeck,
      {
        items: deck.map((p) => /* @__PURE__ */ jsx(
          "a",
          {
            className: "project-card",
            href: "#contact",
            "data-cursor": "view",
            "data-cursor-label": "View",
            children: /* @__PURE__ */ jsxs("div", { className: "project-image", children: [
              /* @__PURE__ */ jsxs("picture", { children: [
                /* @__PURE__ */ jsx(
                  "source",
                  {
                    srcSet: srcSet("projects/" + p.image),
                    type: "image/webp",
                    sizes: "(max-width: 768px) 60vw, 430px"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: asset("projects/" + p.image),
                    alt: "",
                    loading: "lazy",
                    decoding: "async"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "project-overlay", children: /* @__PURE__ */ jsx("span", { className: "project-name", children: p.name }) })
            ] })
          },
          p.name
        ))
      }
    ),
    /* @__PURE__ */ jsxs("a", { className: "text-link section-cta", href: "#contact", children: [
      "See how we work ",
      /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
    ] })
  ] }) }) });
}
export {
  ProjectsSection
};
