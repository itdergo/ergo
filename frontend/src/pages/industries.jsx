import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { IndustriesSection } from "@/components/sections/industries";
function IndustriesPage() {
  const meta = metaForPath("/industries");
  useSeo({ title: meta.title, description: meta.description, path: "/industries" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Industries", path: "/industries" }
    ])
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHero,
      {
        label: "Industries",
        title: "Built for the spaces you run.",
        intro: "ERGO furnishes the environments where people learn, work, gather and recover \u2014 across the Philippines and Southeast Asia.",
        crumb: "Industries"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "page-focus", children: /* @__PURE__ */ jsx(IndustriesSection, {}) })
  ] });
}
export {
  IndustriesPage
};
