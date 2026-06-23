import api, { clearToken, getToken, setToken } from "@shared/api";
import { SESSION_KEY } from "@shared/config";

export function hasWindow() {
  return typeof window !== "undefined";
}

export function getAuthState() {
  if (!hasWindow()) return { isAuthenticated: false };
  const token = getToken();
  const session = window.localStorage.getItem(SESSION_KEY);
  return {
    isAuthenticated: !!token && session === "authenticated",
  };
}

export function setAuthenticated() {
  if (!hasWindow()) return;
  window.localStorage.setItem(SESSION_KEY, "authenticated");
}

export function logout() {
  if (!hasWindow()) return;
  clearToken();
  window.localStorage.removeItem(SESSION_KEY);
}

/**
 * Calls POST /api/auth/login { password }
 * On success: stores JWT and sets session flag.
 * Throws AxiosError on failure.
 */
export async function loginWithPassword(password: string): Promise<{ customerName: string }> {
  const { data } = await api.post<{ accessToken: string; customer: { id: string; name: string } }>(
    "/auth/login",
    { password },
  );
  setToken(data.accessToken);
  setAuthenticated();
  return { customerName: data.customer.name };
}
