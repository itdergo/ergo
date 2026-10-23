/**
 * lib/ai-router.ts — Deterministic task router for the AI workforce.
 *
 * Given a task title + description, scores each employee by keyword overlap
 * with their capability list and returns the best fit. Deterministic (no LLM
 * call) so routing is instant, free, and reproducible — and testable without a
 * model. Ties break by employee order (dev first), which is the sensible
 * default for an engineering-heavy org.
 */
import { AI_EMPLOYEES, type AiEmployee } from "./ai-employees";

export interface RouteResult {
  employee: AiEmployee;
  score: number;
  /** The capability keywords that matched, for explainability in the dashboard. */
  matched: string[];
}

export function routeTask(title: string, description = ""): RouteResult {
  const text = `${title} ${description}`.toLowerCase();
  const tokens = text.split(/[^a-z0-9+]+/).filter(Boolean);

  let best: RouteResult | null = null;
  for (const employee of AI_EMPLOYEES) {
    const matched = employee.capabilities.filter((cap) =>
      tokens.some((t) => t.includes(cap) || cap.includes(t)),
    );
    const score = matched.length;
    if (!best || score > best.score) {
      best = { employee, score, matched };
    }
  }

  // Guarantee a result even when nothing matched: default to the first employee.
  if (!best || best.score === 0) {
    return { employee: AI_EMPLOYEES[0], score: 0, matched: [] };
  }
  return best;
}
