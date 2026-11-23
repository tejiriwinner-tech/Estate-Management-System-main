"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/components/auth/session";
import {
  X,
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

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/management", icon: LayoutGrid },
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    hasFinanceSubmenu: true,
  },
  { label: "Agents", href: "/agents", icon: BriefcaseBusiness },
  { label: "Store", href: "/store", icon: Store },
  { label: "Messages", href: "/messages", icon: MessageSquare, badge: 6 },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Staffs", href: "/staffs", icon: Users },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [financeOpen, setFinanceOpen] = useState(true);

  // Close drawer automatically on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-dark/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col justify-between bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
        <div>
          {/* Header & Close Button */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-xl shadow-sm shadow-primary/20">
                <span className="italic font-serif">LE</span>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-base font-bold text-primary">
                    Lincoln
                  </span>
                  <span className="text-base font-bold text-dark">Estate</span>
                </div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  ADMIN DASHBOARD
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-dark"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
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
                    <div
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
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
                          className={`h-5 w-5 ${
                            isActive ? "text-white" : "text-accent"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setFinanceOpen((prev) => !prev)}
                        aria-label="Toggle Finance Submenu"
                        className="rounded-md p-0.5"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            financeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

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
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "text-dark/70 hover:bg-primary/5 hover:text-dark"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-white" : "text-accent"
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
        </div>

        {/* Bottom Logout */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              clearSession();
              onClose();
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <LogOut className="h-5 w-5 text-primary" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
