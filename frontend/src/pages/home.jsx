import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useSeo, useJsonLd, metaForPath } from "@/lib/seo";
import { ORGANIZATION, LOCAL_BUSINESS, WEBSITE } from "@/lib/structured-data";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ProductsSection } from "@/components/sections/products";
import { SolutionsSection } from "@/components/sections/solutions";
import { IndustriesSection } from "@/components/sections/industries";
import { ProjectsSection } from "@/components/sections/projects";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PartnersSection } from "@/components/sections/partners";
import { FaqSection } from "@/components/sections/faq";
import { CtaBanner } from "@/components/sections/cta-banner";
import { ContactSection } from "@/components/sections/contact";
import { MarqueeBand, ScrollRail } from "@/components/fx";
function HomePage() {
  const meta = metaForPath("/");
  useSeo({ title: meta.title, description: meta.description, path: "/" });
  useJsonLd("organization", ORGANIZATION);
  useJsonLd("localbusiness", LOCAL_BUSINESS);
  useJsonLd("website", WEBSITE);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx(ScrollRail, {}),
      /* @__PURE__ */ jsx(HeroSection, {}),
      /* @__PURE__ */ jsx(MarqueeBand, {}),
      /* @__PURE__ */ jsx(AboutSection, {}),
      /* @__PURE__ */ jsx(ProductsSection, {}),
      /* @__PURE__ */ jsx(SolutionsSection, {}),
      /* @__PURE__ */ jsx(IndustriesSection, {}),
      /* @__PURE__ */ jsx(ProjectsSection, {}),
      /* @__PURE__ */ jsx(PartnersSection, {}),
      /* @__PURE__ */ jsx(TestimonialsSection, {}),
      /* @__PURE__ */ jsx(FaqSection, {}),
      /* @__PURE__ */ jsx(CtaBanner, {}),
      /* @__PURE__ */ jsx(ContactSection, {}),
    ],
  });
}
export { HomePage };
