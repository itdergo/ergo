import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { breadcrumbs } from "@/lib/structured-data";
import { PageHero } from "@/components/page-hero";
import { ContactSection } from "@/components/sections/contact";
function ContactPage() {
  const meta = metaForPath("/contact");
  useSeo({ title: meta.title, description: meta.description, path: "/contact" });
  useJsonLd(
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" }
    ])
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHero,
      {
        label: "Contact",
        title: "Get a Free Consultation",
        intro: "Tell us about your space and requirements. We respond within 24 hours.",
        crumb: "Contact"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "page-focus", children: /* @__PURE__ */ jsx(ContactSection, {}) })
  ] });
}
export {
  ContactPage
};
