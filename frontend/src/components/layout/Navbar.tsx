"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";

interface NavbarProps {
  onOpenMobileDrawer?: () => void;
}

export function Navbar({ onOpenMobileDrawer }: NavbarProps) {
  const router = useRouter();
  const { summary, refresh } = useChatSummary();
  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8">
      {/* Left: Mobile Hamburger & Brand Logo */}
      <div className="flex items-center gap-3">
        {onOpenMobileDrawer && (
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            className="rounded-lg p-2 text-dark hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary text-white font-bold text-lg sm:text-2xl shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
            <span className="italic font-serif">LE</span>
          </div>
          <div>
            <div className="flex items-center leading-tight">
              <span className="text-base sm:text-xl font-bold tracking-tight text-primary">
                Lincoln
              </span>
              <span className="text-base sm:text-xl font-bold tracking-tight text-dark">
                Estate
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              FINANCE SUBSYSTEM
            </p>
          </div>
        </Link>
      </div>

      {/* Center Search Input (hidden on mobile, visible on desktop) */}
      <div className="relative w-full max-w-md hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-accent">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search resident or transaction..."
          className="w-full rounded-full border-0 bg-primary/5 py-2.5 pl-11 pr-4 text-sm text-dark placeholder-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        <NotificationPopover
          unread={summary.unread_total}
          onSeeAll={() => router.push("/admin/messages")}
          onChanged={refresh}
        />

        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-dark leading-tight">
              Admin
            </p>
            <p className="text-xs text-slate-500">Estate Manager</p>
          </div>
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full ring-2 ring-accent bg-dark flex items-center justify-center text-white font-medium text-xs">
            EM
          </div>
        </div>
      </div>
    </header>
  );
}
