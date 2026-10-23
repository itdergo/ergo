import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";
function InquiriesView() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const load = () => {
    api.getInquiries(filter ? { status: filter } : void 0).then((r) => {
      setInquiries(r.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    load();
  }, [filter]);
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: "flex justify-between items-center mb-6",
        children: [
          /* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold text-gray-900",
            children: "Inquiries",
          }),
          /* @__PURE__ */ jsxs("select", {
            value: filter,
            onChange: (e) => setFilter(e.target.value),
            className: "border rounded-lg px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
              /* @__PURE__ */ jsx("option", { value: "new", children: "New" }),
              /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacted" }),
              /* @__PURE__ */ jsx("option", { value: "qualified", children: "Qualified" }),
              /* @__PURE__ */ jsx("option", { value: "proposal", children: "Proposal" }),
              /* @__PURE__ */ jsx("option", { value: "won", children: "Won" }),
              /* @__PURE__ */ jsx("option", { value: "lost", children: "Lost" }),
            ],
          }),
        ],
      }),
      loading
        ? /* @__PURE__ */ jsx("p", { children: "Loading..." })
        : /* @__PURE__ */ jsx("div", {
            className: "bg-white rounded-xl border overflow-hidden",
            children: /* @__PURE__ */ jsxs("table", {
              className: "w-full",
              children: [
                /* @__PURE__ */ jsx("thead", {
                  className: "bg-gray-50",
                  children: /* @__PURE__ */ jsxs("tr", {
                    children: [
                      /* @__PURE__ */ jsx("th", {
                        className: "text-left px-4 py-3 text-xs font-medium text-gray-500",
                        children: "Name",
                      }),
                      /* @__PURE__ */ jsx("th", {
                        className: "text-left px-4 py-3 text-xs font-medium text-gray-500",
                        children: "Email",
                      }),
                      /* @__PURE__ */ jsx("th", {
                        className: "text-left px-4 py-3 text-xs font-medium text-gray-500",
                        children: "Status",
                      }),
                      /* @__PURE__ */ jsx("th", {
                        className: "text-left px-4 py-3 text-xs font-medium text-gray-500",
                        children: "Date",
                      }),
                      /* @__PURE__ */ jsx("th", {
                        className: "text-right px-4 py-3 text-xs font-medium text-gray-500",
                        children: "Actions",
                      }),
                    ],
                  }),
                }),
                /* @__PURE__ */ jsx("tbody", {
                  children: inquiries.map((i) =>
                    /* @__PURE__ */ jsxs(
                      "tr",
                      {
                        className: "border-t",
                        children: [
                          /* @__PURE__ */ jsx("td", {
                            className: "px-4 py-3 text-sm",
                            children: i.name,
                          }),
                          /* @__PURE__ */ jsx("td", {
                            className: "px-4 py-3 text-sm text-gray-500",
                            children: i.email,
                          }),
                          /* @__PURE__ */ jsx("td", {
                            className: "px-4 py-3",
                            children: /* @__PURE__ */ jsxs("select", {
                              value: i.status,
                              onChange: (e) =>
                                api.updateInquiry(i.id, { status: e.target.value }).then(load),
                              className: "text-xs border rounded px-2 py-1",
                              children: [
                                /* @__PURE__ */ jsx("option", { value: "new", children: "New" }),
                                /* @__PURE__ */ jsx("option", {
                                  value: "contacted",
                                  children: "Contacted",
                                }),
                                /* @__PURE__ */ jsx("option", {
                                  value: "qualified",
                                  children: "Qualified",
                                }),
                                /* @__PURE__ */ jsx("option", {
                                  value: "proposal",
                                  children: "Proposal",
                                }),
                                /* @__PURE__ */ jsx("option", { value: "won", children: "Won" }),
                                /* @__PURE__ */ jsx("option", { value: "lost", children: "Lost" }),
                              ],
                            }),
                          }),
                          /* @__PURE__ */ jsx("td", {
                            className: "px-4 py-3 text-sm text-gray-500",
                            children: new Date(i.createdAt).toLocaleDateString(),
                          }),
                          /* @__PURE__ */ jsx("td", {
                            className: "px-4 py-3 text-right",
                            children: /* @__PURE__ */ jsx("button", {
                              onClick: () => api.deleteInquiry(i.id).then(load),
                              className: "text-red-600",
                              children: /* @__PURE__ */ jsx(Trash2, { size: 16 }),
                            }),
                          }),
                        ],
                      },
                      i.id,
                    ),
                  ),
                }),
              ],
            }),
          }),
    ],
  });
}
export { InquiriesView };
