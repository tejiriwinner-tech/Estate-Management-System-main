import type { LoginRole } from "./RoleSelect";

/**
 * (Merge note: sign-in now calls POST /api/v1/auth/login when NEXT_PUBLIC_API_URL is set and keeps the
 * Sanctum token here. The original description follows.)
 * Front-end-only session placeholder (kept in localStorage so it survives new tabs and refreshes).
 * There is no auth API in the Laravel backend yet, so sign-in just records who
 * signed in (email + role) in this browser. Replace with a real call to the
 * backend (e.g. Laravel Sanctum) once it exists.
 */
const KEY = "lincoln.session";

export interface Session {
  email: string;
  role: LoginRole;
  signedInAt: string;
  /** Sanctum token from the Laravel API (absent in offline/placeholder mode). */
  token?: string;
}

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<LoginRole, string> = {
  Admin: "/admin",
  Agent: "/agent-portal",
  User: "/resident",
  Security: "/security/dashboard",
  "Store Owner": "/store-app",
};

/** Server role (users.role) -> login role. */
export function toLoginRole(serverRole: string): LoginRole | null {
  switch (serverRole) {
    case "super_admin":
    case "admin":
    case "manager":
      return "Admin";
    case "agent":
      return "Agent";
    case "resident":
      return "User";
    case "security":
      return "Security";
    case "store_owner":
      return "Store Owner";
    default:
      return null;
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable (private mode) — sign-in still proceeds */
  }
}

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
