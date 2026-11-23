"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { summary, refresh } = useChatSummary();
  const [currentTime, setCurrentTime] = useState({
    date: "OCT 24, 2024",
    time: "14:32 PM WAT",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      const dateStr = now.toLocaleDateString("en-US", optionsDate).toUpperCase();
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-surface-card/90 backdrop-blur-md border-b border-border/80">
      {/* Left: Mobile Menu Trigger & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-xl text-muted hover:text-dark hover:bg-surface-subtle lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar matching Figma */}
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
        {/* Operational Indicator & Clock (hidden on mobile, visible on sm/md) */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[11px] font-semibold text-muted tracking-tight">
            {currentTime.date}
          </span>
          <span className="text-[11px] font-medium text-muted/80">
            {currentTime.time}
          </span>
        </div>

        {/* Operational Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border text-[11px] font-bold text-dark tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span>OPERATIONAL</span>
        </div>

        <NotificationPopover unread={summary.unread_total} onSeeAll={() => router.push("/admin/messages?tab=alerts")} onChanged={refresh} />

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border/80">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-dark leading-tight">
              Administrator
            </span>
            <span className="text-xs text-muted font-medium">
              Estate Manager
            </span>
          </div>

          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent/40 shadow-sm bg-surface-subtle flex items-center justify-center">
            {/* Fallback image / Avatar */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Administrator Avatar"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

