"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/components/auth/session";
import {
  LayoutGrid,
  Wallet,
  Store,
  MessageSquare,
  BarChart3,
  Users,
  BriefcaseBusiness,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  FINANCE_SUB_LINKS,
  isFinanceRoute,
  isSubLinkActive,
} from "./FinanceSubNav";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  hasFinanceSubmenu?: boolean;
}

const navItems: NavItem[] = [
  { label: "Admin Hub", href: "/admin", icon: LayoutGrid },
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    hasFinanceSubmenu: true,
  },
  { label: "Agents", href: "/agents", icon: BriefcaseBusiness },
  { label: "Store", href: "/store-app", icon: Store },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Reports", href: "/finance/reports", icon: BarChart3 },
  { label: "Staffs", href: "/staffs", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [financeOpen, setFinanceOpen] = useState(true);

  return (
    <aside className="sticky top-20 hidden md:flex h-[calc(100vh-5rem)] w-60 flex-col justify-between border-r border-slate-100 bg-white px-4 py-6 flex-shrink-0">
      {/* Primary 6 Group Project Modules */}
      <nav className="space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isFinanceActive =
            item.hasFinanceSubmenu && isFinanceRoute(pathname);
          const isActive =
            isFinanceActive ||
            pathname === item.href ||
            (!item.hasFinanceSubmenu &&
              item.href !== "/" &&
              pathname?.startsWith(item.href));

          if (item.hasFinanceSubmenu) {
            return (
              <div key={item.label} className="space-y-1">
                {/* Parent Finance Row */}
                <div
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "text-dark/70 hover:bg-primary/5 hover:text-dark"
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex flex-1 items-center gap-3.5"
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                        isActive
                          ? "text-white"
                          : "text-accent group-hover:text-primary"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setFinanceOpen((prev) => !prev)}
                    aria-label="Toggle Finance Submenu"
                    className={`rounded-md p-0.5 transition-transform cursor-pointer ${
                      isActive
                        ? "text-white/90 hover:bg-white/15"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        financeOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Nested Finance Sub-Items */}
                {financeOpen && (
                  <div className="ml-6 space-y-0.5 border-l-2 border-primary/15 pl-3 py-1">
                    {FINANCE_SUB_LINKS.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isSubLinkActive(pathname, sub);

                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                            subActive
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-slate-500 hover:bg-slate-50 hover:text-dark"
                          }`}
                        >
                          <SubIcon
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                              subActive ? "text-primary" : "text-accent"
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-dark/70 hover:bg-primary/5 hover:text-dark"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                    isActive
                      ? "text-white"
                      : "text-accent group-hover:text-primary"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-white text-primary"
                      : "bg-accent/20 text-dark"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-primary" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
