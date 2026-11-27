"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, User } from "lucide-react";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";
import { readSession } from "@/components/auth/session";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { summary, refresh } = useChatSummary();
  const [adminProfile, setAdminProfile] = useState({
    name: "Administrator",
    job_title: "Estate Manager",
    avatar_url: "",
  });
  const [currentTime, setCurrentTime] = useState({
    date: "OCT 24, 2024",
    time: "14:32 PM WAT",
  });

  useEffect(() => {
    const session = readSession();
    fetch("/api/v1/admin/profile", {
      headers: session?.email ? { "x-user-email": session.email } : {},
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((j) => {
        if (j?.data?.profile) {
          setAdminProfile({
            name: j.data.profile.name || session?.name || "Administrator",
            job_title: j.data.profile.job_title || "Estate Manager",
            avatar_url: j.data.profile.avatar_url || "",
          });
        }
      })
      .catch(() => {});

    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setAdminProfile((prev) => ({
          name: detail.name ?? prev.name,
          job_title: detail.job_title ?? prev.job_title,
          avatar_url: detail.avatar_url ?? prev.avatar_url,
        }));
      }
    };
    window.addEventListener("pahe-admin-profile-updated", onUpdated);
    return () => window.removeEventListener("pahe-admin-profile-updated", onUpdated);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now
        .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        .toUpperCase();
      const timeStr =
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) + " WAT";

      setCurrentTime({ date: dateStr, time: timeStr });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="shrink-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-surface-card/95 backdrop-blur-md border-b border-border/80">
      {/* Left: Mobile Menu Trigger & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl text-muted hover:text-dark hover:bg-surface-subtle lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search financials..."
            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm bg-surface-subtle border border-border/80 text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right: Operational Status, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[11px] font-semibold text-muted tracking-tight">
            {currentTime.date}
          </span>
          <span className="text-[11px] font-medium text-muted/80">
            {currentTime.time}
          </span>
        </div>

        <NotificationPopover
          unread={summary.unread_total}
          onSeeAll={() => router.push("/admin/messages?tab=alerts")}
          onChanged={refresh}
        />

        {/* Clickable Admin Profile -> /admin/settings */}
        <Link
          href="/admin/settings"
          title="Admin Profile & Settings"
          className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border/80 hover:opacity-85 transition-opacity"
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-dark leading-tight">
              {adminProfile.name}
            </span>
            <span className="text-xs text-muted font-medium">
              {adminProfile.job_title}
            </span>
          </div>

          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent/40 shadow-sm bg-surface-subtle flex items-center justify-center shrink-0">
            {adminProfile.avatar_url ? (
              <img
                src={adminProfile.avatar_url}
                alt={adminProfile.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-5 h-5 text-muted" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
