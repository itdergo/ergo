import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ResourcesSection } from "@/components/sections/resources";
function ResourcesPage() {
  const meta = metaForPath("/resources");
  useSeo({ title: meta.title, description: meta.description, path: "/resources" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
    ]),
  );
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx(PageHero, {
        label: "Resources & Catalog",
        title: "Brochures & specifications.",
        intro:
          "Download our catalogues and product specifications for seating, desking, systems furniture and storage.",
        crumb: "Resources",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "page-focus",
        children: /* @__PURE__ */ jsx(ResourcesSection, {}),
      }),
    ],
  });
}
export { ResourcesPage };
