import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
function CategoriesView() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.getCategories().then(setCats);
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsx("h2", {
        className: "text-2xl font-bold text-gray-900 mb-6",
        children: "Categories",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        children: cats.map((c) =>
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-white p-4 rounded-xl border",
              children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: c.name }),
                /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-gray-500 mt-1",
                  children: c.description,
                }),
              ],
            },
            c.id,
          ),
        ),
      }),
    ],
  });
}
export { CategoriesView };
