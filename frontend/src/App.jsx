import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, lazy, Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { api } from "@/lib/api";
import { SiteProvider } from "@/lib/site-context";
import { SiteLayout } from "@/components/site-layout";
import { CustomCursor, Grain } from "@/components/fx";
import { HomePage } from "@/pages/home";
// Admin UI is lazy-loaded so it never ships in the public site chunk. The
// public bundle only includes the login shell; the full panel is fetched on
// demand, and the API still enforces auth server-side regardless.
const LoginPage = lazy(() =>
  import("@/components/admin/admin-panel").then((m) => ({ default: m.LoginPage })),
);
const AdminPanel = lazy(() =>
  import("@/components/admin/admin-panel").then((m) => ({ default: m.AdminPanel })),
);
const ProductsPage = lazy(() =>
  import("@/pages/products").then((m) => ({ default: m.ProductsPage })),
);
const ProductDetailPage = lazy(() =>
  import("@/pages/product-detail").then((m) => ({ default: m.ProductDetailPage })),
);
const SolutionsPage = lazy(() =>
  import("@/pages/solutions").then((m) => ({ default: m.SolutionsPage })),
);
const IndustriesPage = lazy(() =>
  import("@/pages/industries").then((m) => ({ default: m.IndustriesPage })),
);
const ProjectsPage = lazy(() =>
  import("@/pages/projects").then((m) => ({ default: m.ProjectsPage })),
);
const ContactPage = lazy(() => import("@/pages/contact").then((m) => ({ default: m.ContactPage })));
const ResourcesPage = lazy(() =>
  import("@/pages/resources").then((m) => ({ default: m.ResourcesPage })),
);
import { NotFoundPage } from "@/pages/not-found";
function App() {
  const [currentView, setCurrentView] = useState("site");
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api
        .getMe()
        .then((res) => {
          if (res.user?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            api.setToken(null);
          }
        })
        .catch(() => {
          setIsAdmin(false);
          api.setToken(null);
        });
    }
  }, []);
  const handleLogin = () => {
    setIsAdmin(true);
    setCurrentView("admin");
  };
  const handleLogout = () => {
    api.setToken(null);
    setIsAdmin(false);
    setCurrentView("site");
  };
  // Admin views are lazy-loaded; a Suspense boundary lets the admin chunk load
  // without unmounting the app. The fallback keeps a minimal shell on screen.
  if (currentView === "login" || (currentView === "admin" && isAdmin)) {
    return /* @__PURE__ */ jsxs(Suspense, {
      fallback: /* @__PURE__ */ jsx("div", { className: "admin-boot", children: "Loading\u2026" }),
      children: [
        currentView === "login" &&
          /* @__PURE__ */ jsx(LoginPage, {
            onLogin: handleLogin,
            onBack: () => setCurrentView("site"),
          }),
        currentView === "admin" &&
          isAdmin &&
          /* @__PURE__ */ jsx(AdminPanel, {
            onLogout: handleLogout,
            onViewSite: () => setCurrentView("site"),
          }),
      ],
    });
  }
  return (
    // Public site view: wrapped in Router + SiteProvider + SiteLayout
    /* @__PURE__ */ jsx(Router, {
      children: /* @__PURE__ */ jsxs(SiteProvider, {
        children: [
          /* @__PURE__ */ jsx(Grain, {}),
          /* @__PURE__ */ jsx(CustomCursor, {}),
          /* @__PURE__ */ jsx(SiteLayout, {
            onAdminLogin: () => setCurrentView("login"),
            children: /* @__PURE__ */ jsx(Suspense, {
              fallback: null,
              children: /* @__PURE__ */ jsxs(Switch, {
                children: [
                  /* @__PURE__ */ jsx(Route, { path: "/", component: HomePage }),
                  /* @__PURE__ */ jsx(Route, { path: "/products", component: ProductsPage }),
                  /* @__PURE__ */ jsx(Route, {
                    path: "/products/:slug",
                    component: ProductDetailPage,
                  }),
                  /* @__PURE__ */ jsx(Route, { path: "/solutions", component: SolutionsPage }),
                  /* @__PURE__ */ jsx(Route, { path: "/industries", component: IndustriesPage }),
                  /* @__PURE__ */ jsx(Route, { path: "/projects", component: ProjectsPage }),
                  /* @__PURE__ */ jsx(Route, { path: "/resources", component: ResourcesPage }),
                  /* @__PURE__ */ jsx(Route, { path: "/contact", component: ContactPage }),
                  /* @__PURE__ */ jsx(Route, { component: NotFoundPage }),
                ],
              }),
            }),
          }),
        ],
      }),
    })
  );
}
var stdin_default = App;
export { stdin_default as default };
