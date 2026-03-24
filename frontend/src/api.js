const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getToken   = ()  => localStorage.getItem("resumeai_token");
export const setToken   = (t) => localStorage.setItem("resumeai_token", t);
export const clearToken = ()  => localStorage.removeItem("resumeai_token");

/**
 * Wrapper around fetch that automatically injects the JWT Authorization header.
 * Usage is identical to fetch(), except the URL is a path like "/history".
 */
export async function apiFetch(path, { headers = {}, ...options } = {}) {
  const token = getToken();
  if (token) headers = { ...headers, Authorization: `Bearer ${token}` };
  return fetch(`${API_BASE}${path}`, { headers, ...options });
}
