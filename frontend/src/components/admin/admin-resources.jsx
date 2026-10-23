import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
function ResourcesView() {
  const [res, setRes] = useState([]);
  useEffect(() => {
    api.getResources().then(setRes);
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsx("h2", {
        className: "text-2xl font-bold text-gray-900 mb-6",
        children: "Resources",
      }),
      /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
        children: res.map((r) =>
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-white p-4 rounded-xl border",
              children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: r.title }),
                /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-gray-500 mt-1",
                  children: r.description,
                }),
                /* @__PURE__ */ jsx("a", {
                  href: r.fileUrl,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "text-sm text-green-600 mt-2 inline-block",
                  children: "View File",
                }),
              ],
            },
            r.id,
          ),
        ),
      }),
    ],
  });
}
export { ResourcesView };
