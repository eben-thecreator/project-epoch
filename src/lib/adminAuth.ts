import { apiUrl } from "./api";

const TOKEN_KEY = "schis-admin-token";

export const getAdminToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setAdminToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAdminToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean =>
  Boolean(getAdminToken());

/**
 * fetch wrapper for admin endpoints: attaches the bearer token and
 * normalizes error handling (401 clears the stored session).
 */
export const adminFetch = async (
  input: string,
  init: RequestInit = {}
): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = getAdminToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    clearAdminToken();
  }
  return response;
};

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export const loginAdmin = async (password: string): Promise<LoginResult> => {
  try {
    const response = await fetch(apiLoginUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body.error || "Invalid credentials." };
    }
    const body = await response.json();
    setAdminToken(body.token);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the server." };
  }
};

const apiLoginUrl = () => apiUrl("/api/admin/login");
