import { jsx, jsxs } from "react/jsx-runtime";
import { useReducedMotion } from "@/lib/site-ui-primitives";
const DEFAULT_ITEMS = [
  "German Engineering",
  "BIFMA Standards",
  "Designed for Work",
  "Made to Last",
  "Built for the Philippines",
];
function MarqueeBand({ items = DEFAULT_ITEMS }) {
  const reduced = useReducedMotion();
  const line = `${items.join("   \xB7   ")}   \xB7   `;
  return /* @__PURE__ */ jsx("div", {
    className: "marquee-band",
    "data-reduced": reduced || void 0,
    children: /* @__PURE__ */ jsxs("div", {
      className: "marquee-band-track",
      children: [
        /* @__PURE__ */ jsx("span", { className: "marquee-band-line", children: line }),
        /* @__PURE__ */ jsx("span", {
          className: "marquee-band-line",
          "aria-hidden": "true",
          children: line,
        }),
      ],
    }),
  });
}
export { MarqueeBand };
