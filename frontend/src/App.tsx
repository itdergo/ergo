/**
 * App.tsx — Root application component.
 *
 * Responsibilities:
 * - View state management: switches between "site", "admin", and "login" views
 * - Authentication: checks for stored auth token on mount, handles login/logout
 * - Routing: uses wouter Router with lazy-loaded page components for code splitting
 * - Layout: wraps the public site in SiteProvider (context) and SiteLayout (header/footer)
 *
 * Data flow:
 * - Auth token stored in localStorage, validated via api.getMe() on mount
 * - Page components are lazy-loaded via React.lazy() for better initial bundle size
 * - Admin views are conditionally rendered based on auth state
 *
 * Routing table (mirrors src/routes.json):
 *   /                 → HomePage (full landing page)
 *   /products         → ProductsPage (product index)
 *   /products/:slug   → ProductDetailPage (individual product)
 *   /solutions        → SolutionsPage
 *   /industries       → IndustriesPage
 *   /projects         → ProjectsPage
 *   /contact          → ContactPage
 *   *                 → NotFoundPage (404)
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { api } from "@/lib/api";
import { SiteProvider } from "@/lib/site-context";
import { SiteLayout } from "@/components/site-layout";
import { LoginPage, AdminPanel } from "@/components/admin/admin-panel";
import { HomePage } from "@/pages/home";
const ProductsPage = lazy(() =>
  import("@/pages/products").then((m) => ({ default: m.ProductsPage })),
);
// Lazy-load page components for code splitting — reduces initial bundle size
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

/**
 * Route table (mirrors src/routes.json, which also drives the sitemap
 * generator and the prerender pass).
 *
 *   /                 home - full landing page
 *   /products         product index
 *   /products/:slug   product detail (Product + Breadcrumb schema)
 *   /solutions        workplace solutions
 *   /industries       industries served
 *   /projects         featured installations
 *   /resources        catalogues & specifications
 *   /contact          consultation request
 */
function App() {
  const [currentView, setCurrentView] = useState<"site" | "admin" | "login">("site");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing auth token on mount to restore session
    const token = localStorage.getItem("auth_token");
    if (token) {
      api
        .getMe()
        // Validate token against backend AND verify admin role
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

  if (currentView === "login") {
    // Login view: standalone page, no site layout wrapper
    return <LoginPage onLogin={handleLogin} onBack={() => setCurrentView("site")} />;
  }
  if (currentView === "admin" && isAdmin) {
    // Admin view: only rendered when authenticated
    return <AdminPanel onLogout={handleLogout} onViewSite={() => setCurrentView("site")} />;
  }

  return (
    // Public site view: wrapped in Router + SiteProvider + SiteLayout
    <Router>
      <SiteProvider>
        <SiteLayout onAdminLogin={() => setCurrentView("login")}>
          <Suspense fallback={null}>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/products/:slug" component={ProductDetailPage} />
              <Route path="/solutions" component={SolutionsPage} />
              <Route path="/industries" component={IndustriesPage} />
              <Route path="/projects" component={ProjectsPage} />
              <Route path="/resources" component={ResourcesPage} />
              <Route path="/contact" component={ContactPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </Suspense>
        </SiteLayout>
      </SiteProvider>
    </Router>
  );
}

export default App;
