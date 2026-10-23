/**
 * components/admin-panel.tsx — Admin authentication and panel layout.
 *
 * Exports two components:
 * - LoginPage: email/password login form with error handling
 * - AdminPanel: tabbed management interface with sidebar navigation
 *
 * AdminPanel provides access to 7 management views:
 *   Dashboard, Products, Inquiries, Categories, Resources, Industries, Solutions
 *
 * Authentication flow:
 * 1. User enters credentials in LoginPage
 * 2. api.login() sends credentials to backend
 * 3. On success, token is stored and onLogin callback fires
 * 4. App.tsx switches to admin view
 *
 * The admin panel uses simple tab state (no router) for view switching.
 */
import { useState, useEffect, type FormEvent } from "react";
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
  Bot,
} from "lucide-react";
import { DashboardView } from "@/components/admin/admin-dashboard";
import { ProductsView } from "@/components/admin/admin-products";
import { InquiriesView } from "@/components/admin/admin-inquiries";
import { CategoriesView } from "@/components/admin/admin-categories";
import { ResourcesView } from "@/components/admin/admin-resources";
import { IndustriesView } from "@/components/admin/admin-industries";
import { SolutionsView } from "@/components/admin/admin-solutions";
import { WorkforceView } from "@/components/admin/admin-workforce";

// Admin panel + login screen, extracted verbatim from App.tsx.

export function LoginPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    // Login form: validates credentials, shows loading/error states
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      // On successful login: store token, trigger parent callback
      api.setToken(res.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button onClick={onBack} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
          ← Back to site
        </button>
      </div>
    </div>
  );
}

export function AdminPanel({
  // AdminPanel: sidebar layout with tab-based view switching
  onLogout,
  onViewSite,
}: {
  onLogout: () => void;
  onViewSite: () => void;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Verify token is still valid before showing admin UI
    api
      .getMe()
      .then((res) => {
        if (res.user?.role === "admin") {
          setTokenValid(true);
        } else {
          onLogout();
        }
      })
      .catch(() => onLogout());
  }, []);

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verifying...</p>
        </div>
      </div>
    );
  }

  // Tab configuration: 7 admin views with icons
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "industries", label: "Industries", icon: Building2 },
    { id: "solutions", label: "Solutions", icon: Settings },
    { id: "workforce", label: "AI Workforce", icon: Bot },
  ];
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">ERGO Admin</h1>
          <p className="text-xs text-gray-500">Management Panel</p>
        </div>
        <nav className="flex-1 p-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 ${activeTab === t.id ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onViewSite}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <ArrowUpRight size={18} />
            View Site
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "dashboard" && <DashboardView />}
        {/* Conditional view rendering based on active tab */}
        {activeTab === "products" && <ProductsView />}
        {activeTab === "inquiries" && <InquiriesView />}
        {activeTab === "categories" && <CategoriesView />}
        {activeTab === "resources" && <ResourcesView />}
        {activeTab === "industries" && <IndustriesView />}
        {activeTab === "solutions" && <SolutionsView />}
        {activeTab === "workforce" && <WorkforceView />}
      </main>
    </div>
  );
}
