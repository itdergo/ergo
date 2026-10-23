import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getIcon } from "@/lib/image-maps";
function IndustriesView() {
  const [inds, setInds] = useState([]);
  useEffect(() => {
    api.getIndustries().then(setInds);
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsx("h2", {
        className: "text-2xl font-bold text-gray-900 mb-6",
        children: "Industries",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        children: inds.map((i) =>
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-white p-4 rounded-xl border flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600",
                  children: getIcon(i.icon, 20),
                }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: i.name }),
              ],
            },
            i.id,
          ),
        ),
      }),
    ],
  });
}
export { IndustriesView };
