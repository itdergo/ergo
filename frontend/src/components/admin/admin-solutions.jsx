import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { asset } from "@/lib/types";
import { getIcon } from "@/lib/image-maps";
function SolutionsView() {
  const [sols, setSols] = useState([]);
  useEffect(() => {
    api.getSolutions().then(setSols);
  }, []);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Solutions" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: asset("solutions-showroom.jpg"),
        alt: "ERGO Solutions Showroom",
        className: "w-full rounded-xl border border-gray-200",
        loading: "eager"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: sols.map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-xl border", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600", children: getIcon(s.icon, 20) }),
        /* @__PURE__ */ jsx("h3", { className: "font-medium", children: s.title })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: s.description })
    ] }, s.id)) })
  ] });
}
export {
  SolutionsView
};
