/**
 * lib/ai-employees.ts — The 5 AI employees of the ERGO workforce.
 *
 * Each employee is a specialized agent with a role, a system prompt, a set of
 * capability keywords used by the router, and a brand color for the dashboard.
 * The router (ai-router.ts) picks the best fit for an incoming task; the
 * dashboard renders them as "bots" with live status.
 */
export interface AiEmployee {
  id: string;
  name: string;
  role: string;
  title: string;
  color: string;
  icon: string;
  capabilities: string[];
  systemPrompt: string;
}

export const AI_EMPLOYEES: AiEmployee[] = [
  {
    id: "dev-engineer",
    name: "Dev",
    role: "Full-Stack Developer",
    title: "Dev Engineer",
    color: "#16a34a",
    icon: "💻",
    capabilities: [
      "code",
      "build",
      "bug",
      "fix",
      "feature",
      "api",
      "frontend",
      "backend",
      "deploy",
      "database",
      "typescript",
      "react",
      "node",
      "git",
      "refactor",
      "test",
      "debug",
      "error",
      "performance",
    ],
    systemPrompt:
      "You are Dev, the ERGO full-stack software engineer. You write, review, debug, and ship code across the React frontend and Node/Express backend. You think in concrete diffs, tests, and edge cases, and you never ship without verifying builds.",
  },
  {
    id: "business-analyst",
    name: "Analyst",
    role: "Business Analyst",
    title: "Business Analyst",
    color: "#2563eb",
    icon: "📊",
    capabilities: [
      "analysis",
      "report",
      "research",
      "requirement",
      "spec",
      "metric",
      "kpi",
      "trend",
      "market",
      "competitor",
      "data",
      "insight",
      "forecast",
      "brief",
      "summary",
      "strategy",
    ],
    systemPrompt:
      "You are Analyst, the ERGO business analyst. You turn raw data and vague requests into clear requirements, reports, and decisions. You quantify, cite sources, and flag assumptions.",
  },
  {
    id: "customer-support",
    name: "Support",
    role: "Customer Support",
    title: "Customer Support",
    color: "#d97706",
    icon: "🎧",
    capabilities: [
      "support",
      "ticket",
      "reply",
      "customer",
      "inquiry",
      "email",
      "chat",
      "faq",
      "complaint",
      "feedback",
      "onboarding",
      "help",
      "response",
      "client",
    ],
    systemPrompt:
      "You are Support, the ERGO customer-support specialist. You triage inquiries, draft empathetic replies, resolve issues, and keep clients informed. You escalate anything contractual or safety-related to a human.",
  },
  {
    id: "marketing-content",
    name: "Marketing",
    role: "Marketing & Content",
    title: "Marketing & Content",
    color: "#9333ea",
    icon: "📣",
    capabilities: [
      "marketing",
      "content",
      "copy",
      "blog",
      "social",
      "seo",
      "campaign",
      "ad",
      "newsletter",
      "brand",
      "headline",
      "landing",
      "email",
      "promotion",
    ],
    systemPrompt:
      "You are Marketing, the ERGO content and growth specialist. You write clear, on-brand copy, plan campaigns, and optimize for search and conversion. You match the ERGO voice: professional, precise, warm.",
  },
  {
    id: "ops-qa",
    name: "Ops",
    role: "Operations & QA",
    title: "Ops & QA",
    color: "#0d9488",
    icon: "🛡️",
    capabilities: [
      "qa",
      "test",
      "monitor",
      "deploy",
      "release",
      "incident",
      "uptime",
      "regression",
      "audit",
      "security",
      "backup",
      "pipeline",
      "ci",
      "cd",
      "infrastructure",
    ],
    systemPrompt:
      "You are Ops, the ERGO operations and QA specialist. You verify releases, monitor health, catch regressions, and keep the platform reliable. You are the last line of defence before a change ships.",
  },
];

export function getEmployee(id: string): AiEmployee | undefined {
  return AI_EMPLOYEES.find((e) => e.id === id);
}
