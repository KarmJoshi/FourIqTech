// ═══════════════════════════════════════════════════════════════════════
// 🔐 AGENCY API CLIENT — Centralized fetch with auth
// ═══════════════════════════════════════════════════════════════════════

export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

// API secret for authenticated requests (mutations)
const API_SECRET = import.meta.env.VITE_API_SECRET || "fouriq-agency-secret-2026";

/**
 * Authenticated fetch wrapper. Adds auth headers to all mutation requests.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth header for mutations
  if (method !== "GET") {
    headers["x-api-key"] = API_SECRET;
  }

  // Add content-type for JSON bodies
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
}

/**
 * GET request (no auth needed for reads)
 */
export async function apiGet(endpoint: string) {
  return fetch(`${API_BASE_URL}${endpoint}`).catch(() => null);
}

/**
 * POST request (authenticated)
 */
export async function apiPost(endpoint: string, body?: unknown) {
  return apiFetch(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request (authenticated)
 */
export async function apiPatch(endpoint: string, body?: unknown) {
  return apiFetch(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}
