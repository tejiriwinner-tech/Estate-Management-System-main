const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
}

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = json?.errors ? Object.values<string[]>(json.errors)[0]?.[0] : undefined;
    throw new Error(first || json?.message || "Request failed.");
  }
  return json as T;
}

export async function loginRequest(email: string, password: string) {
  const r = await post<{ data: { token: string; user: AuthUser } }>("/auth/login", { email, password });
  return r.data;
}

export const forgotPasswordRequest = (email: string) => post("/auth/forgot-password", { email });

export const setPasswordRequest = (p: { email: string; token: string; password: string; password_confirmation: string }) =>
  post("/auth/set-password", p);
