"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Camera } from "lucide-react";
import { Card, StateMsg } from "./ui";
import { Profile } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

const TABS = [
  { href: "/resident/profile", label: "About" },
  { href: "/resident/profile/family", label: "Family Members" },
  { href: "/resident/profile/properties", label: "Properties" },
  { href: "/resident/profile/settings", label: "Settings" },
];

const COVER_PRESETS: Record<string, string> = {
  "preset:crimson-gold": "bg-gradient-to-r from-[#B22222] via-[#8F1A1A] to-[#C9A227]/85",
  "preset:charcoal-gold": "bg-gradient-to-r from-[#1A1A1A] via-[#2D2D2D] to-[#C9A227]/80",
  "preset:emerald-palm": "bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-500",
  "preset:royal-navy": "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-700",
};

export function ProfileFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, error, loading } = useResident<Profile>("/profile");
  const cover = data?.cover_url || "preset:crimson-gold";
  const isImageCover = cover.startsWith("data:") || cover.startsWith("http") || cover.startsWith("/");
  const presetClass = COVER_PRESETS[cover] || COVER_PRESETS["preset:crimson-gold"];

  return (
    <div className="space-y-8">
      <Card className="p-4 shadow-xs border border-slate-200/80">
        <div className={`relative h-44 rounded-xl overflow-hidden sm:h-52 ${!isImageCover ? presetClass : "bg-slate-900"}`}>
          {isImageCover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Profile cover" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          <Link
            href="/resident/profile/settings#cover"
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-xl bg-black/45 hover:bg-black/65 backdrop-blur-xs px-3 py-1.5 text-[11px] font-bold text-white border border-white/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Change Cover</span>
          </Link>
        </div>
        <StateMsg loading={loading} error={error} />
        {data && (
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-6 px-4 pb-2">
            <div className="flex flex-wrap items-end gap-6">
              <div className="relative h-24 w-24 rounded-full border-4 border-white bg-[#FEF2F2] overflow-hidden shadow-md flex items-center justify-center shrink-0">
                {data.avatar_url ? (
                  <img
                    src={data.avatar_url}
                    alt={data.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-[#B22222]">{data.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="pt-10">
                <p className="text-2xl font-extrabold text-gray-900">{data.name}</p>
                <p className="text-sm font-semibold text-slate-500">
                  {data.resident_code} • {data.unit_number || "Estate Unit"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-gray-900">{data.email}</p>
                <p className="text-xs text-slate-500">{data.phone || "No phone set"}</p>
              </div>
              <Link
                href="/resident/profile/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#B22222]" />
                <span>Edit Photo &amp; Profile</span>
              </Link>
            </div>
          </div>
        )}
      </Card>
      <Card className="p-5">
        <nav className="flex gap-6 overflow-x-auto border-b border-slate-200 text-sm font-bold sm:gap-10 sm:px-2">
          {TABS.map((t) => {
            const active = t.href === "/resident/profile" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`whitespace-nowrap pb-3.5 transition-colors ${
                  active
                    ? "border-b-2 border-[#B22222] text-[#B22222]"
                    : "text-slate-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-6">{children}</div>
      </Card>
    </div>
  );
}
