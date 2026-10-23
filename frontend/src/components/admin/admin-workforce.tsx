/**
 * components/admin/admin-workforce.tsx — AI Workforce dashboard.
 *
 * Renders the 5 AI employees as "bots" with live status (idle/busy), a task
 * inbox, and a form to create new tasks. New tasks are auto-routed to the best
 * employee by the backend router; the chosen employee and the matched keywords
 * are shown for explainability.
 *
 * Status lifecycle: queued → running → done | failed. Operators can advance a
 * task manually (run / complete / fail) or delete it.
 */
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Bot, Play, CheckCircle2, XCircle, Trash2, Send, Sparkles } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  title: string;
  color: string;
  icon: string;
  busy: boolean;
  activeTasks: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  employeeId: string;
  status: "queued" | "running" | "done" | "failed";
  result: string | null;
  createdAt: string;
  completedAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function WorkforceView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastRouting, setLastRouting] = useState<any>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [empRes, taskRes] = await Promise.all([api.getAiEmployees(), api.getAiTasks(100)]);
      setEmployees(empRes.data || []);
      setTasks(taskRes.data || []);
      setError("");
    } catch (e: any) {
      setError(e?.message || "Failed to load workforce");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleCreate = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const advance = async (task: Task, status: "running" | "done" | "failed") => {
    try {
      await api.updateAiTask(task.id, { status });
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteAiTask(id);
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to delete task");
    }
  };

  const empById = (id: string) => employees.find((e) => e.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Workforce</h2>
          <p className="text-sm text-gray-500">
            5 AI employees. Tasks are auto-routed to the best fit.
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Bot roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2"
            style={{ borderTop: `4px solid ${emp.color}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emp.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  emp.busy ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${emp.busy ? "bg-blue-500 animate-pulse" : "bg-green-500"}`}
                />
                {emp.busy ? "Busy" : "Idle"}
              </span>
              {emp.activeTasks > 0 && (
                <span className="text-gray-500">{emp.activeTasks} running</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Last routing explanation */}
      {lastRouting && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-start gap-2">
          <Sparkles size={16} className="text-green-600 mt-0.5" />
          <div>
            <span className="font-medium text-green-800">
              Routed to {lastRouting.employee?.name} ({lastRouting.employee?.role})
            </span>
            {lastRouting.matched?.length > 0 && (
              <span className="text-green-700"> — matched: {lastRouting.matched.join(", ")}</span>
            )}
            {lastRouting.score === 0 && (
              <span className="text-green-700">
                {" "}
                — no keyword match, defaulted to first employee
              </span>
            )}
          </div>
        </div>
      )}

      {/* Create task */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
      >
        <h3 className="font-semibold text-gray-900">Assign a new task</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title (e.g. Fix login bug, Write Q3 report)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details — the router uses these keywords to pick the right employee"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          <Send size={14} />
          {submitting ? "Routing…" : "Create & route"}
        </button>
      </form>

      {/* Task inbox */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Task inbox</h3>
          <span className="text-xs text-gray-500">{tasks.length} tasks</span>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No tasks yet. Create one above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const emp = empById(task.employeeId);
              return (
                <li key={task.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: (emp?.color || "#6b7280") + "1a",
                            color: emp?.color || "#6b7280",
                          }}
                        >
                          <Bot size={12} />
                          {emp?.name || task.employeeId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 mt-1">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-0.5">{task.description}</div>
                      )}
                      {task.result && (
                        <div className="text-sm text-gray-700 mt-1 italic">→ {task.result}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {task.status === "queued" && (
                        <button
                          onClick={() => advance(task, "running")}
                          title="Start"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {task.status === "running" && (
                        <>
                          <button
                            onClick={() => advance(task, "done")}
                            title="Complete"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => advance(task, "failed")}
                            title="Fail"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => remove(task.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
