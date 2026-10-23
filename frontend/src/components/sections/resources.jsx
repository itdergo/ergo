import { jsx, jsxs } from "react/jsx-runtime";
import { useSite } from "@/lib/site-context";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowRight, FileText, ShieldCheck } from "lucide-react";
function ResourcesSection() {
  const { resources } = useSite();
  return /* @__PURE__ */ jsx(ScrollReveal, {
    children: /* @__PURE__ */ jsx("section", {
      className: "section section-muted",
      id: "resources",
      children: /* @__PURE__ */ jsxs("div", {
        className: "container",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "section-head",
            children: [
              /* @__PURE__ */ jsx("span", {
                className: "section-label",
                children: "Resources & Catalog",
              }),
              /* @__PURE__ */ jsx("h2", {
                className: "section-heading",
                children: "Brochures & specifications.",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "section-intro",
                children: "Download our catalogues and product specifications.",
              }),
            ],
          }),
          /* @__PURE__ */ jsx("div", {
            className: "resource-grid",
            children: resources.map((r, i) =>
              /* @__PURE__ */ jsxs(
                motion.a,
                {
                  className: "resource-card",
                  href: r.fileUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-40px" },
                  transition: { duration: 0.4, delay: i * 0.08 },
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className: "icon-tile",
                      children:
                        r.fileType === "warranty"
                          ? /* @__PURE__ */ jsx(ShieldCheck, { size: 21 })
                          : /* @__PURE__ */ jsx(FileText, { size: 21 }),
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsx("h3", { children: r.title }),
                        /* @__PURE__ */ jsx("p", {
                          className: "card-description",
                          children: r.description,
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "download-label",
                          children: [
                            r.fileType === "warranty" ? "View page" : "Download",
                            r.fileType === "warranty"
                              ? /* @__PURE__ */ jsx(ArrowRight, { size: 13 })
                              : /* @__PURE__ */ jsx(ArrowDownToLine, { size: 13 }),
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                r.id,
              ),
            ),
          }),
        ],
      }),
    }),
  });
}
export { ResourcesSection };
