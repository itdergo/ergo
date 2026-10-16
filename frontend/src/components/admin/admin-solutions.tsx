/**
 * components/admin/admin-solutions.tsx — Admin solutions view.
 *
 * Read-only display of solutions with a showroom image header.
 * Each card shows the solution icon, title, and description.
 *
 * Note: View-only; solution management is not implemented.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { asset } from "@/lib/types";
import { getIcon } from "@/lib/image-maps";
import type { Solution } from "@/lib/types";

export function SolutionsView() {
  const [sols, setSols] = useState<Solution[]>([]);
  useEffect(() => {
    api.getSolutions().then(setSols);
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Solutions</h2>
      <div className="mb-6">
        <img
          src={asset("solutions-showroom.jpg")}
          alt="ERGO Solutions Showroom"
          className="w-full rounded-xl border border-gray-200"
          loading="eager"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sols.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                {getIcon(s.icon, 20)}
              </div>
              <h3 className="font-medium">{s.title}</h3>
            </div>
            <p className="text-sm text-gray-500">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
