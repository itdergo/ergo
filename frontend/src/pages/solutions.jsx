import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { SolutionsSection } from "@/components/sections/solutions";
function SolutionsPage() {
  const meta = metaForPath("/solutions");
  useSeo({ title: meta.title, description: meta.description, path: "/solutions" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
    ]),
  );
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx(PageHero, {
        label: "Solutions",
        title: "End-to-end workplace solutions.",
        intro:
          "Beyond furniture, ERGO partners with you through every stage \u2014 from concept to a fully installed, functional space.",
        crumb: "Solutions",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "page-focus",
        children: /* @__PURE__ */ jsx(SolutionsSection, {}),
      }),
    ],
  });
}
export { SolutionsPage };
