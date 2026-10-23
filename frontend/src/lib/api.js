const API_BASE = "/api";
class ApiClient {
  baseUrl;
  token = null;
  csrfToken = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
  }
  setCsrfToken(token) {
    this.csrfToken = token;
  }
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const method = (options.method || "GET").toUpperCase();
    if (this.csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      headers["X-CSRF-Token"] = this.csrfToken;
    }
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : void 0,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }
  // Products
  getProducts(params) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.featured) query.set("featured", "true");
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));
    const qs = query.toString();
    return this.request(`/products${qs ? `?${qs}` : ""}`);
  }
  getProduct(slug) {
    return this.request(`/products/${slug}`);
  }
  createProduct(data) {
    return this.request("/products", { method: "POST", body: data });
  }
  updateProduct(id, data) {
    return this.request(`/products/${id}`, { method: "PATCH", body: data });
  }
  deleteProduct(id) {
    return this.request(`/products/${id}`, { method: "DELETE" });
  }
  // Categories
  getCategories() {
    return this.request("/categories");
  }
  // Inquiries
  getInquiries(params) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return this.request(`/inquiries${qs ? `?${qs}` : ""}`);
  }
  createInquiry(data) {
    return this.request("/inquiries", { method: "POST", body: data });
  }
  updateInquiry(id, data) {
    return this.request(`/inquiries/${id}`, { method: "PATCH", body: data });
  }
  deleteInquiry(id) {
    return this.request(`/inquiries/${id}`, { method: "DELETE" });
  }
  // Resources
  getResources() {
    return this.request("/resources");
  }
  // Industries
  getIndustries() {
    return this.request("/industries");
  }
  // Solutions
  getSolutions() {
    return this.request("/solutions");
  }
  // AI Workforce
  getAiEmployees() {
    return this.request("/ai/employees");
  }
  getAiTasks(limit) {
    const qs = limit ? `?limit=${limit}` : "";
    return this.request(`/ai/tasks${qs}`);
  }
  createAiTask(data) {
    return this.request("/ai/tasks", {
      method: "POST",
      body: data,
    });
  }
  updateAiTask(id, data) {
    return this.request(`/ai/tasks/${id}`, {
      method: "PATCH",
      body: data,
    });
  }
  deleteAiTask(id) {
    return this.request(`/ai/tasks/${id}`, { method: "DELETE" });
  }
  // Auth
  getMe() {
    return this.request("/auth/me");
  }
  async login(email, password) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (res.csrfToken) {
      this.setCsrfToken(res.csrfToken);
    }
    return res;
  }
  register(data) {
    return this.request("/auth/register", {
      method: "POST",
      body: data,
    });
  }
}
const api = new ApiClient(API_BASE);
export { api };
