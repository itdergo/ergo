/**
 * lib/api.ts — Backend API client.
 *
 * Provides a singleton ApiClient instance (`api`) that handles all HTTP
 * communication with the backend server. Features:
 * - Automatic Bearer token injection from localStorage
 * - JSON request/response handling
 * - Typed methods for all API endpoints
 * - Query string building for filtered requests
 *
 * API endpoints covered:
 * - Products: CRUD operations with filtering (category, search, status, featured)
 * - Categories: read-only listing
 * - Inquiries: CRUD with status workflow (new → contacted → qualified → proposal → won/lost)
 * - Resources: read-only listing
 * - Industries: read-only listing
 * - Solutions: read-only listing
 * - Auth: login, register, getMe (token validation)
 *
 * Usage: import { api } from "@/lib/api"; then api.getProducts(), api.login(), etc.
 */
import type { Category, Product, Industry, Solution, Resource, Inquiry } from "@/lib/types";
import type { NewProduct, User } from "@ergo/database";

const API_BASE = "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
    // Token persisted in localStorage for session restoration across page reloads
  }

  setCsrfToken(token: string | null) {
    this.csrfToken = token;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(path: string, options: ApiOptions = {}): Promise<T> {
    // Generic request method: builds headers, handles auth, parses JSON errors
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      // Inject Bearer token for authenticated requests
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Add CSRF token for mutating requests
    const method = (options.method || "GET").toUpperCase();
    if (this.csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      headers["X-CSRF-Token"] = this.csrfToken;
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      // Parse error response body for descriptive error messages
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Products
  getProducts(params?: {
    category?: string;
    search?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    // Build query string from filter params for product listing
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.featured) query.set("featured", "true");
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));
    const qs = query.toString();
    return this.request<{ data: Product[]; total: number }>(`/products${qs ? `?${qs}` : ""}`);
  }

  getProduct(slug: string) {
    return this.request<Product>(`/products/${slug}`);
  }

  createProduct(data: NewProduct) {
    return this.request<Product>("/products", { method: "POST", body: data });
  }

  updateProduct(id: string, data: Partial<NewProduct>) {
    return this.request<Product>(`/products/${id}`, { method: "PATCH", body: data });
  }

  deleteProduct(id: string) {
    return this.request<Product>(`/products/${id}`, { method: "DELETE" });
  }

  // Categories
  getCategories() {
    return this.request<Category[]>("/categories");
  }

  // Inquiries
  getInquiries(params?: { status?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return this.request<{ data: Inquiry[]; total: number }>(`/inquiries${qs ? `?${qs}` : ""}`);
  }

  createInquiry(data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
    source?: string;
  }) {
    return this.request<Inquiry>("/inquiries", { method: "POST", body: data });
  }

  updateInquiry(id: string, data: { status?: string; assignedTo?: string; notes?: string }) {
    return this.request<Inquiry>(`/inquiries/${id}`, { method: "PATCH", body: data });
  }

  deleteInquiry(id: string) {
    return this.request<Inquiry>(`/inquiries/${id}`, { method: "DELETE" });
  }

  // Resources
  getResources() {
    return this.request<Resource[]>("/resources");
  }

  // Industries
  getIndustries() {
    return this.request<Industry[]>("/industries");
  }

  // Solutions
  getSolutions() {
    return this.request<Solution[]>("/solutions");
  }

  // AI Workforce
  getAiEmployees() {
    return this.request<{ data: any[] }>("/ai/employees");
  }

  getAiTasks(limit?: number) {
    const qs = limit ? `?limit=${limit}` : "";
    return this.request<{ data: any[] }>(`/ai/tasks${qs}`);
  }

  createAiTask(data: { title: string; description?: string }) {
    return this.request<{ data: any; routing: any }>("/ai/tasks", {
      method: "POST",
      body: data,
    });
  }

  updateAiTask(id: string, data: { status?: string; result?: string }) {
    return this.request<{ data: any }>(`/ai/tasks/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  deleteAiTask(id: string) {
    return this.request<{ data: any }>(`/ai/tasks/${id}`, { method: "DELETE" });
  }

  // Auth
  getMe() {
    return this.request<{ user: User }>("/auth/me");
  }

  async login(email: string, password: string) {
    const res = await this.request<{ token: string; csrfToken: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: { email, password },
      },
    );
    if (res.csrfToken) {
      this.setCsrfToken(res.csrfToken);
    }
    return res;
  }

  register(data: { email: string; password: string; name: string; role?: string }) {
    return this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: data,
    });
  }
}

export const api = new ApiClient(API_BASE);
