"use client";

import { cn } from "@/lib/security/utils";

export interface SecurityMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface Props {
  members: SecurityMember[];
}

export default function SecurityMembersTable({ members }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[--color-border] bg-[--color-bg]">
            {["Name", "Role", "Email", "Phone"].map((h) => (
              <th key={h} className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[--color-border]">
          {members.map((m, i) => (
            <tr key={m.id} className={cn("hover:bg-gray-50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-gray-50/40")}>
              <td className="px-5 py-2.5 text-sm text-[--color-text]">{m.name}</td>
              <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{m.role}</td>
              <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{m.email || "—"}</td>
              <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{m.phone || "—"}</td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-xs text-center text-[--color-text-muted]">
                No security members yet. Add staff with the security role from Admin → Staff.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
