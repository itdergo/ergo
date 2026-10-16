/**
 * components/admin/admin-categories.tsx — Admin categories view.
 *
 * Read-only display of product categories in a responsive grid.
 * Each card shows category name and description.
 *
 * Note: This is a view-only component; category management
 * (add/edit/delete) is not implemented in the admin panel.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export function CategoriesView() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    api.getCategories().then(setCats);
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl border">
            <h3 className="font-medium">{c.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
