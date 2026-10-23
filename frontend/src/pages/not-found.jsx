import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/lib/seo";
function NotFoundPage() {
  useSeo({
    title: "Page not found | ERGO Contracts Philippines",
    description: "The page you were looking for could not be found.",
    path: "/404"
  });
  return /* @__PURE__ */ jsx("section", { className: "section", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("span", { className: "section-label", children: "404" }),
    /* @__PURE__ */ jsx("h1", { className: "section-heading", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "section-intro", children: "That page doesn\u2019t exist or has moved. Try the product range or get in touch." }),
    /* @__PURE__ */ jsxs("div", { className: "hero-actions", children: [
      /* @__PURE__ */ jsxs(Link, { className: "button-primary", href: "/products", children: [
        "Browse products ",
        /* @__PURE__ */ jsx(ArrowRight, { size: 15 })
      ] }),
      /* @__PURE__ */ jsx(Link, { className: "button-secondary", href: "/contact", children: "Contact us" })
    ] })
  ] }) });
}
var stdin_default = NotFoundPage;
export {
  NotFoundPage,
  stdin_default as default
};
