/**
 * components/admin/admin-resources.tsx — Admin resources view.
 *
 * Read-only display of resources in a 2-column grid.
 * Each card shows title, description, and a "View File" link.
 *
 * Note: View-only; resource management is not implemented.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Resource } from "@/lib/types";

export function ResourcesView() {
  const [res, setRes] = useState<Resource[]>([]);
  useEffect(() => {
    api.getResources().then(setRes);
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {res.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-xl border">
            <h3 className="font-medium">{r.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{r.description}</p>
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-green-600 mt-2 inline-block"
            >
              View File
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
