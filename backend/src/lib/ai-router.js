import { AI_EMPLOYEES } from "./ai-employees";
function routeTask(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const tokens = text.split(/[^a-z0-9+]+/).filter(Boolean);
  let best = null;
  for (const employee of AI_EMPLOYEES) {
    const matched = employee.capabilities.filter((cap) =>
      tokens.some((t) => t.includes(cap) || cap.includes(t)),
    );
    const score = matched.length;
    if (!best || score > best.score) {
      best = { employee, score, matched };
    }
  }
  if (!best || best.score === 0) {
    return { employee: AI_EMPLOYEES[0], score: 0, matched: [] };
  }
  return best;
}
export { routeTask };
