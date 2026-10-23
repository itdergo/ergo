import { jsx, jsxs } from "react/jsx-runtime";
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { getIcon } from "@/lib/image-maps";
import { industryImages } from "@/lib/image-maps";
import { ArrowRight } from "lucide-react";
import { useSite } from "@/lib/site-context";
import { KineticHeading } from "@/components/fx";
function IndustriesSection() {
  const { industries } = useSite();
  if (industries.length === 0) return null;
  return /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx("section", { className: "section", id: "industries", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "section-head", children: [
      /* @__PURE__ */ jsx("span", { className: "section-label", children: "Industries" }),
      /* @__PURE__ */ jsx(
        KineticHeading,
        {
          as: "h2",
          className: "section-heading section-heading--md",
          text: "Built for the spaces you run."
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "section-intro", children: "ERGO furnishes the environments where people learn, work, gather and recover \u2014 across the Philippines and Southeast Asia." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "industry-grid", children: industries.map((ind) => {
      const photo = industryImages[ind.name];
      return /* @__PURE__ */ jsxs("div", { className: "industry-card", children: [
        /* @__PURE__ */ jsx("div", { className: "industry-image", children: photo ? /* @__PURE__ */ jsxs("picture", { children: [
          /* @__PURE__ */ jsx(
            "source",
            {
              srcSet: srcSet(photo),
              type: "image/webp",
              sizes: "(max-width: 1023px) 50vw, 25vw"
            }
          ),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: asset(photo),
              alt: `${ind.name} furniture installations by ERGO Contracts Philippines`,
              loading: "lazy",
              decoding: "async",
              width: 400,
              height: 300
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "industry-icon", children: getIcon(ind.icon, 20) }) }),
        /* @__PURE__ */ jsx("span", { children: ind.name })
      ] }, ind.id);
    }) }),
    /* @__PURE__ */ jsxs("a", { className: "text-link section-cta", href: "#contact", children: [
      "Discuss your space ",
      /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
    ] })
  ] }) }) });
}
export {
  IndustriesSection
};
