/**
 * components/admin/admin-industries.tsx — Admin industries view.
 *
 * Read-only display of industries in a responsive grid.
 * Each card shows the industry icon and name.
 *
 * Note: View-only; industry management is not implemented.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getIcon } from "@/lib/image-maps";
import type { Industry } from "@/lib/types";

export function IndustriesView() {
  const [inds, setInds] = useState<Industry[]>([]);
  useEffect(() => {
    api.getIndustries().then(setInds);
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Industries</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inds.map((i) => (
          <div key={i.id} className="bg-white p-4 rounded-xl border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              {getIcon(i.icon, 20)}
            </div>
            <span className="font-medium">{i.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
