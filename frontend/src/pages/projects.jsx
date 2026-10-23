import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ProjectsSection } from "@/components/sections/projects";
function ProjectsPage() {
  const meta = metaForPath("/projects");
  useSeo({ title: meta.title, description: meta.description, path: "/projects" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
    ]),
  );
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx(PageHero, {
        label: "Projects",
        title: "Featured installations.",
        intro:
          "A selection of recent ERGO installations across the Philippines \u2014 from corporate headquarters and universities to arenas and government facilities.",
        crumb: "Projects",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "page-focus",
        children: /* @__PURE__ */ jsx(ProjectsSection, {}),
      }),
    ],
  });
}
export { ProjectsPage };
