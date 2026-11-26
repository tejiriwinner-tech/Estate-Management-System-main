"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X, LogOut, type LucideIcon } from "lucide-react";
import { clearSession, readSession } from "@/components/auth/session";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";

export interface UnifiedNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

interface UnifiedPortalShellProps {
  portalLabel: string;
  roleSubtitle: string;
  displayNameOverride?: string;
  homeHref: string;
  messagesHref: string;
  searchPlaceholder?: string;
  navItems: UnifiedNavItem[];
  footerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function UnifiedPortalShell({
  portalLabel,
  roleSubtitle,
  displayNameOverride,
  homeHref,
  messagesHref,
  searchPlaceholder = "Search Post Army Housing Estate...",
  navItems,
  footerExtra,
  children,
}: UnifiedPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { summary, refresh } = useChatSummary();
  const session = readSession();
  const displayName = displayNameOverride || session?.name || portalLabel;
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "PA";

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Unified Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="h-20 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link
              href={homeHref}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#B22222] text-white font-extrabold text-sm shadow-sm">
                <span>PAHE</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#C9A227] border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  Post Army Housing
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                  {portalLabel}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-[#B22222] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        active ? "bg-white text-[#B22222]" : "bg-[#C9A227]/20 text-slate-900"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 border-t border-slate-100 space-y-2">
          {footerExtra}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#B22222] hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B22222]/25 focus:border-[#B22222]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationPopover
              unread={summary.unread_total}
              onSeeAll={() => router.push(messagesHref)}
              onChanged={refresh}
            />

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
                <p className="text-[11px] font-medium text-slate-500">{roleSubtitle}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-[#B22222]/20 flex items-center justify-center text-xs font-extrabold text-[#B22222]">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
