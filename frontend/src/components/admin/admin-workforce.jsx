import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Bot, Play, CheckCircle2, XCircle, Trash2, Send, Sparkles } from "lucide-react";
const STATUS_COLORS = {
  queued: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};
function WorkforceView() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastRouting, setLastRouting] = useState(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const [empRes, taskRes] = await Promise.all([api.getAiEmployees(), api.getAiTasks(100)]);
      setEmployees(empRes.data || []);
      setTasks(taskRes.data || []);
      setError("");
    } catch (e) {
      setError(e?.message || "Failed to load workforce");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5e3);
    return () => clearInterval(interval);
  }, [refresh]);
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await api.createAiTask({ title: title.trim(), description: description.trim() });
      setLastRouting(res.routing);
      setTitle("");
      setDescription("");
      await refresh();
    } catch (err) {
      setError(err?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };
  const advance = async (task, status) => {
    try {
      await api.updateAiTask(task.id, { status });
      await refresh();
    } catch (err) {
      setError(err?.message || "Failed to update task");
    }
  };
  const remove = async (id) => {
    try {
      await api.deleteAiTask(id);
      await refresh();
    } catch (err) {
      setError(err?.message || "Failed to delete task");
    }
  };
  const empById = (id) => employees.find((e) => e.id === id);
  return /* @__PURE__ */ jsxs("div", {
    className: "space-y-6",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          /* @__PURE__ */ jsxs("div", {
            children: [
              /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold text-gray-900",
                children: "AI Workforce",
              }),
              /* @__PURE__ */ jsx("p", {
                className: "text-sm text-gray-500",
                children: "5 AI employees. Tasks are auto-routed to the best fit.",
              }),
            ],
          }),
          /* @__PURE__ */ jsx("button", {
            onClick: refresh,
            className: "px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50",
            children: "Refresh",
          }),
        ],
      }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
      /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",
        children: employees.map((emp) =>
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2",
              style: { borderTop: `4px solid ${emp.color}` },
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-2xl", children: emp.icon }),
                    /* @__PURE__ */ jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsx("div", {
                          className: "font-semibold text-gray-900",
                          children: emp.name,
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "text-xs text-gray-500",
                          children: emp.role,
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2 text-xs",
                  children: [
                    /* @__PURE__ */ jsxs("span", {
                      className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${emp.busy ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`,
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: `w-1.5 h-1.5 rounded-full ${emp.busy ? "bg-blue-500 animate-pulse" : "bg-green-500"}`,
                        }),
                        emp.busy ? "Busy" : "Idle",
                      ],
                    }),
                    emp.activeTasks > 0 &&
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-gray-500",
                        children: [emp.activeTasks, " running"],
                      }),
                  ],
                }),
              ],
            },
            emp.id,
          ),
        ),
      }),
      lastRouting &&
        /* @__PURE__ */ jsxs("div", {
          className:
            "bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-start gap-2",
          children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 16, className: "text-green-600 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", {
              children: [
                /* @__PURE__ */ jsxs("span", {
                  className: "font-medium text-green-800",
                  children: [
                    "Routed to ",
                    lastRouting.employee?.name,
                    " (",
                    lastRouting.employee?.role,
                    ")",
                  ],
                }),
                lastRouting.matched?.length > 0 &&
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-green-700",
                    children: [" \u2014 matched: ", lastRouting.matched.join(", ")],
                  }),
                lastRouting.score === 0 &&
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-green-700",
                    children: [" ", "\u2014 no keyword match, defaulted to first employee"],
                  }),
              ],
            }),
          ],
        }),
      /* @__PURE__ */ jsxs("form", {
        onSubmit: handleCreate,
        className: "bg-white rounded-xl border border-gray-200 p-4 space-y-3",
        children: [
          /* @__PURE__ */ jsx("h3", {
            className: "font-semibold text-gray-900",
            children: "Assign a new task",
          }),
          /* @__PURE__ */ jsx("input", {
            type: "text",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Task title (e.g. Fix login bug, Write Q3 report)",
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
            required: true,
          }),
          /* @__PURE__ */ jsx("textarea", {
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder:
              "Optional details \u2014 the router uses these keywords to pick the right employee",
            rows: 3,
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
          }),
          /* @__PURE__ */ jsxs("button", {
            type: "submit",
            disabled: submitting || !title.trim(),
            className:
              "inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(Send, { size: 14 }),
              submitting ? "Routing\u2026" : "Create & route",
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-xl border border-gray-200 overflow-hidden",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "px-4 py-3 border-b border-gray-200 flex items-center justify-between",
            children: [
              /* @__PURE__ */ jsx("h3", {
                className: "font-semibold text-gray-900",
                children: "Task inbox",
              }),
              /* @__PURE__ */ jsxs("span", {
                className: "text-xs text-gray-500",
                children: [tasks.length, " tasks"],
              }),
            ],
          }),
          loading
            ? /* @__PURE__ */ jsx("div", {
                className: "p-6 text-sm text-gray-500",
                children: "Loading\u2026",
              })
            : tasks.length === 0
              ? /* @__PURE__ */ jsx("div", {
                  className: "p-6 text-sm text-gray-500",
                  children: "No tasks yet. Create one above.",
                })
              : /* @__PURE__ */ jsx("ul", {
                  className: "divide-y divide-gray-100",
                  children: tasks.map((task) => {
                    const emp = empById(task.employeeId);
                    return /* @__PURE__ */ jsx(
                      "li",
                      {
                        className: "p-4 flex flex-col gap-2",
                        children: /* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-3",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex-1 min-w-0",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex items-center gap-2 flex-wrap",
                                  children: [
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                      style: {
                                        background: (emp?.color || "#6b7280") + "1a",
                                        color: emp?.color || "#6b7280",
                                      },
                                      children: [
                                        /* @__PURE__ */ jsx(Bot, { size: 12 }),
                                        emp?.name || task.employeeId,
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: `px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`,
                                      children: task.status,
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsx("div", {
                                  className: "font-medium text-gray-900 mt-1",
                                  children: task.title,
                                }),
                                task.description &&
                                  /* @__PURE__ */ jsx("div", {
                                    className: "text-sm text-gray-500 mt-0.5",
                                    children: task.description,
                                  }),
                                task.result &&
                                  /* @__PURE__ */ jsxs("div", {
                                    className: "text-sm text-gray-700 mt-1 italic",
                                    children: ["\u2192 ", task.result],
                                  }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex items-center gap-1 shrink-0",
                              children: [
                                task.status === "queued" &&
                                  /* @__PURE__ */ jsx("button", {
                                    onClick: () => advance(task, "running"),
                                    title: "Start",
                                    className: "p-1.5 rounded-lg text-blue-600 hover:bg-blue-50",
                                    children: /* @__PURE__ */ jsx(Play, { size: 14 }),
                                  }),
                                task.status === "running" &&
                                  /* @__PURE__ */ jsxs(Fragment, {
                                    children: [
                                      /* @__PURE__ */ jsx("button", {
                                        onClick: () => advance(task, "done"),
                                        title: "Complete",
                                        className:
                                          "p-1.5 rounded-lg text-green-600 hover:bg-green-50",
                                        children: /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }),
                                      }),
                                      /* @__PURE__ */ jsx("button", {
                                        onClick: () => advance(task, "failed"),
                                        title: "Fail",
                                        className: "p-1.5 rounded-lg text-red-600 hover:bg-red-50",
                                        children: /* @__PURE__ */ jsx(XCircle, { size: 14 }),
                                      }),
                                    ],
                                  }),
                                /* @__PURE__ */ jsx("button", {
                                  onClick: () => remove(task.id),
                                  title: "Delete",
                                  className:
                                    "p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600",
                                  children: /* @__PURE__ */ jsx(Trash2, { size: 14 }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      },
                      task.id,
                    );
                  }),
                }),
        ],
      }),
    ],
  });
}
export { WorkforceView };
