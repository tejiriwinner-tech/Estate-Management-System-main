"use client";

// Profile header (cover photo area, avatar, name, resident code, email) + About / Family Members / Properties / Settings tabs.
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Card, StateMsg } from "./ui";
import { Profile } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

const TABS = [
  { href: "/resident/profile", label: "About" },
  { href: "/resident/profile/family", label: "Family Members" },
  { href: "/resident/profile/properties", label: "Properties" },
  { href: "/resident/profile/settings", label: "Settings" },
];

export function ProfileFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, error, loading } = useResident<Profile>("/profile");
  return (
    <div className="space-y-8">
      <Card className="p-4 shadow-[0_4px_4px_#cafad5]">
        <div className="h-48 rounded-md bg-gradient-to-br from-brand to-mint sm:h-64" aria-hidden />
        <StateMsg loading={loading} error={error} />
        {data && (
          <div className="-mt-10 flex flex-wrap items-end gap-x-10 gap-y-2 px-4 pb-2">
            <span className="flex h-24 w-28 items-center justify-center rounded-full border-4 border-white bg-mint text-3xl font-bold text-brand">{data.name.slice(0, 1)}</span>
            <div className="pt-10"><p className="text-2xl text-brand">{data.name}</p><p className="text-lg text-muted">{data.resident_code}</p></div>
            <div className="pt-10"><p className="text-2xl">{data.email}</p><p className="text-lg text-muted">Email</p></div>
          </div>
        )}
      </Card>
      <Card className="p-5">
        <nav className="flex gap-6 overflow-x-auto border-b border-muted text-lg sm:gap-10 sm:px-2">
          {TABS.map((t) => {
            const active = t.href === "/resident/profile" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`whitespace-nowrap pb-4 ${active ? "border-b-4 border-brand text-brand" : "text-muted hover:text-brand"}`}>{t.label}</Link>
            );
          })}
        </nav>
        <div className="pt-6">{children}</div>
      </Card>
    </div>
  );
}
