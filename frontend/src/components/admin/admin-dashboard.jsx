import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Package, MessageSquare, FolderOpen, FileText } from "lucide-react";
function DashboardView() {
  const [stats, setStats] = useState({ products: 0, inquiries: 0, categories: 0, resources: 0 });
  useEffect(() => {
    Promise.all([
      // Parallel data fetching: all stats loaded in single Promise.all
      api.getProducts({ limit: 1 }),
      api.getInquiries(),
      api.getCategories(),
      api.getResources(),
    ]).then(([p, i, c, r]) =>
      setStats({
        products: p.total,
        inquiries: i.total,
        categories: c.length,
        resources: r.length,
      }),
    );
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsx("h2", {
        className: "text-2xl font-bold text-gray-900 mb-6",
        children: "Dashboard",
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        children: [
          /* @__PURE__ */ jsx(StatCard, {
            title: "Products",
            value: stats.products,
            icon: Package,
            color: "green",
          }),
          /* @__PURE__ */ jsx(StatCard, {
            title: "Inquiries",
            value: stats.inquiries,
            icon: MessageSquare,
            color: "blue",
          }),
          /* @__PURE__ */ jsx(StatCard, {
            title: "Categories",
            value: stats.categories,
            icon: FolderOpen,
            color: "purple",
          }),
          /* @__PURE__ */ jsx(StatCard, {
            title: "Resources",
            value: stats.resources,
            icon: FileText,
            color: "orange",
          }),
        ],
      }),
    ],
  });
}
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "bg-white p-6 rounded-xl border border-gray-200",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: `w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`,
        children: /* @__PURE__ */ jsx(Icon, { size: 20 }),
      }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: title }),
    ],
  });
}
export { DashboardView };
