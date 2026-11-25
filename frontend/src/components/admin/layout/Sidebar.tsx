"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Store,
  MessageSquare,
  BarChart3,
  Users,
  LogOut,
  X,
  ShieldCheck,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/admin/utils";
import { clearSession } from "@/components/auth/session";
import { useChatSummary } from "@/lib/chat/useChatSummary";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Finance", href: "/admin/finance", icon: CreditCard },
  { name: "Store Management", href: "/admin/store", icon: Store },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Staffs", href: "/admin/staffs", icon: Users },
  { name: "Listings", href: "/admin/listings", icon: ClipboardCheck }, // agent listing approval (KAN-66)
];

const financeSubLinks = [
  { name: "Finance Overview", href: "/admin/finance" },
  { name: "Payment Records", href: "/admin/finance/payments" },
  { name: "Outstanding Arrears", href: "/admin/finance/outstanding" },
  { name: "Estate Services", href: "/admin/finance/services" },
  { name: "Financial Analytics", href: "/admin/finance/analytics" },
];

const storeSubLinks = [
  { name: "Store Overview", href: "/admin/store" },
  { name: "Inventory Management", href: "/admin/store/inventory" },
  { name: "Product Catalog", href: "/admin/store/products" },
  { name: "Orders & Analytics", href: "/admin/store/analytics" },
  { name: "Subscription", href: "/admin/store/subscription" },
  { name: "Store Settings", href: "/admin/store/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { summary } = useChatSummary();
  const isFinanceActive = pathname.startsWith("/admin/finance") || pathname.startsWith("/finance") || pathname.startsWith("/payments") || pathname.startsWith("/outstanding") || pathname.startsWith("/services");
  const isStoreActive = pathname.startsWith("/admin/store") || pathname.startsWith("/store-app");
  const [financeOpen, setFinanceOpen] = React.useState(true);
  const [storeOpen, setStoreOpen] = React.useState(false);

  // Keep open whenever browsing respective section
  React.useEffect(() => {
    if (isFinanceActive) setFinanceOpen(true);
  }, [isFinanceActive]);

  React.useEffect(() => {
    if (isStoreActive) setStoreOpen(true);
  }, [isStoreActive]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-surface-card border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-border/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            {/* Monogram Logo */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold text-lg shadow-md transition-transform group-hover:scale-105">
              <span className="tracking-tighter">LE</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-dark">
                Post Army House<span className="text-primary"> Estate</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                Admin Dashboard
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isFinanceItem = item.name === "Finance";

            if (isFinanceItem) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    type="button"
                    aria-expanded={financeOpen}
                    aria-controls="admin-finance-submenu"
                    onClick={(e) => {
                      e.preventDefault();
                      setFinanceOpen((prev) => !prev);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left group select-none",
                      isFinanceActive
                        ? "bg-primary text-white shadow-sm font-semibold"
                        : "text-muted hover:text-dark hover:bg-surface-subtle"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isFinanceActive ? "text-white" : "text-muted group-hover:text-primary"
                        )}
                      />
                      <span>Finance</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        financeOpen ? "rotate-180" : "rotate-0",
                        isFinanceActive ? "text-white/80" : "text-muted"
                      )}
                    />
                  </button>

                  <div
                    id="admin-finance-submenu"
                    className={cn(
                      "transition-all duration-200 overflow-hidden",
                      financeOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    )}
                  >
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-primary/20 ml-5 my-1">
                      {financeSubLinks.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={onClose}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                              isSubActive
                                ? "bg-primary-light text-primary font-bold shadow-xs"
                                : "text-muted hover:text-dark hover:bg-surface-subtle"
                            )}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive =
              pathname === item.href ||
              (item.href === "/admin/dashboard" &&
                (pathname === "/admin" ||
                  pathname === "/admin/dashboard" ||
                  pathname.startsWith("/admin/dashboard/"))) ||
              (item.href === "/admin/staffs" &&
                (pathname.startsWith("/admin/staffs") || pathname.startsWith("/admin/users")));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "text-muted hover:text-dark hover:bg-surface-subtle"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-white" : "text-muted group-hover:text-primary"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.href === "/admin/messages" && summary.unread_total > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold rounded-full",
                      isActive
                        ? "bg-white text-primary"
                        : "bg-accent text-dark"
                    )}
                  >
                    {summary.unread_total}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Security / System Footer */}
        <div className="p-4 border-t border-border/60">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                clearSession();
                window.location.href = "/login";
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary-light transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

