/**
 * components/admin/admin-inquiries.tsx — Admin inquiries management.
 *
 * Full management interface for contact form inquiries:
 * - Status filter: dropdown to filter by status (new, contacted, qualified,
 *   proposal, won, lost)
 * - Table view: name, email, status (inline editable), date, delete
 * - Inline status editing: select dropdown updates status via API
 * - Delete: removes inquiry with API call
 *
 * Data: inquiries from API, filtered by status.
 * State: filter (status string), loading, inquiries array.
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";
import type { Inquiry } from "@/lib/types";

export function InquiriesView() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const load = () => {
    // load(): fetches inquiries with optional status filter
    api.getInquiries(filter ? { status: filter } : undefined).then((r) => {
      setInquiries(r.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    load();
  }, [filter]);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inquiries</h2>
        <select
          // Status filter: triggers reload when changed
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{i.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{i.email}</td>
                  <td className="px-4 py-3">
                    <select
                      // Inline status editing: updates via API and reloads list
                      value={i.status}
                      onChange={(e) =>
                        api.updateInquiry(i.id, { status: e.target.value }).then(load)
                      }
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => api.deleteInquiry(i.id).then(load)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
