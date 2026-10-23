import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  FileText,
  FolderOpen,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Bot
} from "lucide-react";
import { DashboardView } from "@/components/admin/admin-dashboard";
import { ProductsView } from "@/components/admin/admin-products";
import { InquiriesView } from "@/components/admin/admin-inquiries";
import { CategoriesView } from "@/components/admin/admin-categories";
import { ResourcesView } from "@/components/admin/admin-resources";
import { IndustriesView } from "@/components/admin/admin-industries";
import { SolutionsView } from "@/components/admin/admin-solutions";
import { WorkforceView } from "@/components/admin/admin-workforce";
function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      api.setToken(res.token);
      onLogin();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-8 rounded-2xl shadow-lg w-full max-w-md", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Admin Login" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2",
            required: true
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm mb-4", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50",
          children: loading ? "Logging in..." : "Login"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: onBack, className: "mt-4 text-sm text-gray-500 hover:text-gray-700", children: "\u2190 Back to site" })
  ] }) });
}
function AdminPanel({
  // AdminPanel: sidebar layout with tab-based view switching
  onLogout,
  onViewSite
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tokenValid, setTokenValid] = useState(false);
  useEffect(() => {
    api.getMe().then((res) => {
      if (res.user?.role === "admin") {
        setTokenValid(true);
      } else {
        onLogout();
      }
    }).catch(() => onLogout());
  }, []);
  if (!tokenValid) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Verifying..." })
    ] }) });
  }
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "industries", label: "Industries", icon: Building2 },
    { id: "solutions", label: "Solutions", icon: Settings },
    { id: "workforce", label: "AI Workforce", icon: Bot }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-100 flex", children: [
    /* @__PURE__ */ jsxs("aside", { className: "w-64 bg-white border-r border-gray-200 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-200", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold text-gray-900", children: "ERGO Admin" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Management Panel" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 p-2", children: tabs.map((t) => {
        const Icon = t.icon;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(t.id),
            className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 ${activeTab === t.id ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { size: 18 }),
              t.label
            ]
          },
          t.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-2 border-t border-gray-200", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onViewSite,
            className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50",
            children: [
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 }),
              "View Site"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onLogout,
            className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50",
            children: [
              /* @__PURE__ */ jsx(LogOut, { size: 18 }),
              "Logout"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 p-6 overflow-auto", children: [
      activeTab === "dashboard" && /* @__PURE__ */ jsx(DashboardView, {}),
      activeTab === "products" && /* @__PURE__ */ jsx(ProductsView, {}),
      activeTab === "inquiries" && /* @__PURE__ */ jsx(InquiriesView, {}),
      activeTab === "categories" && /* @__PURE__ */ jsx(CategoriesView, {}),
      activeTab === "resources" && /* @__PURE__ */ jsx(ResourcesView, {}),
      activeTab === "industries" && /* @__PURE__ */ jsx(IndustriesView, {}),
      activeTab === "solutions" && /* @__PURE__ */ jsx(SolutionsView, {}),
      activeTab === "workforce" && /* @__PURE__ */ jsx(WorkforceView, {})
    ] })
  ] });
}
export {
  AdminPanel,
  LoginPage
};
