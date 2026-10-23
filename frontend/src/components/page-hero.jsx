import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
function PageHero({ label, title, intro, crumb }) {
  return /* @__PURE__ */ jsx("section", {
    className: "page-hero",
    children: /* @__PURE__ */ jsxs("div", {
      className: "container",
      children: [
        /* @__PURE__ */ jsxs("nav", {
          className: "breadcrumbs",
          "aria-label": "Breadcrumb",
          children: [
            /* @__PURE__ */ jsx(Link, { href: "/", children: "Home" }),
            /* @__PURE__ */ jsx(ChevronRight, { size: 13, "aria-hidden": "true" }),
            /* @__PURE__ */ jsx("span", { "aria-current": "page", children: crumb }),
          ],
        }),
        /* @__PURE__ */ jsx("span", { className: "section-label", children: label }),
        /* @__PURE__ */ jsx("h1", { className: "section-heading", children: title }),
        /* @__PURE__ */ jsx("p", { className: "section-intro", children: intro }),
      ],
    }),
  });
}
export { PageHero };
