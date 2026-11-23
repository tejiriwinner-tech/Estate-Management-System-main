"use client";

import { useState } from "react";
import { cn } from "@/lib/security/utils";
import SecurityProfileHeader from "@/components/security/members/SecurityProfileHeader";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";
import SecurityMembersTable, { type SecurityMember } from "@/components/security/members/SecurityMembersTable";

type Tab = "About" | "Security Members";

export default function SecurityMembersPage() {
  const [activeTab, setActiveTab]   = useState<Tab>("About");
  const { data, error } = useSecurityData<{ members: SecurityMember[] }>("/security/members", { members: [] });
  const members = data.members;

  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error} />
      {/* Profile header — cover + avatar */}
      <SecurityProfileHeader
        name="Estate Security"
        unitId={`${members.length} member${members.length === 1 ? "" : "s"}`}
        email=""
        showEmail={false}
      />

      {/* Tabs + content card */}
      <div className="bg-white rounded-xl border border-[--color-border] flex flex-col">
        {/* Tab bar */}
        <div className="flex border-b border-[--color-border] px-5">
          {(["About", "Security Members"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors",
                activeTab === tab
                  ? "border-[--color-primary] text-[--color-primary]"
                  : "border-transparent text-[--color-text-muted] hover:text-[--color-text]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === "About" && (
          <div className="p-6 flex flex-col gap-2 min-h-[160px]">
            <p className="text-sm text-[--color-text]">
              The estate security team currently has {members.length} registered member{members.length === 1 ? "" : "s"}.
            </p>
            <p className="text-sm text-[--color-text-muted]">
              Add or edit security staff from Admin → Staff.
            </p>
          </div>
        )}

        {/* Security Members tab */}
        {activeTab === "Security Members" && (
          <SecurityMembersTable members={members} />
        )}
      </div>
    </div>
  );
}
