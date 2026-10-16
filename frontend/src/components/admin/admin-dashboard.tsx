/**
 * components/admin/admin-dashboard.tsx — Admin dashboard overview.
 *
 * Displays summary statistics in a 4-column card grid:
 * - Products count
 * - Inquiries count
 * - Categories count
 * - Resources count
 *
 * Data is fetched on mount via Promise.all for parallel loading.
 * Each stat card shows an icon, value, and label with color coding.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Package, MessageSquare, FolderOpen, FileText } from "lucide-react";

export function DashboardView() {
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
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Products" value={stats.products} icon={Package} color="green" />
        <StatCard title="Inquiries" value={stats.inquiries} icon={MessageSquare} color="blue" />
        <StatCard title="Categories" value={stats.categories} icon={FolderOpen} color="purple" />
        <StatCard title="Resources" value={stats.resources} icon={FileText} color="orange" />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}
