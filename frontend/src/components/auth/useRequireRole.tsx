"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readSession } from "./session";
import type { LoginRole } from "./RoleSelect";

/**
 * Role gate for module layouts (KAN-14). Redirects to /login when there is no session or the
 * signed-in role is not allowed here. Client-side only: the API enforces the same roles with
 * ESTATE_ENFORCE_AUTH=true.
 */
export function useRequireRole(allowed: LoginRole[]): boolean {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const s = readSession();
    if (s && allowed.includes(s.role)) setOk(true);
    else router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  return ok;
}
