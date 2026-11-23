"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Receipt,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  Wrench,
  CreditCard,
  Layers,
  Split,
  ShieldCheck,
} from "lucide-react";

export interface FinanceSubLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export const FINANCE_SUB_LINKS: FinanceSubLink[] = [
  { label: "Overview", href: "/finance", icon: Wallet, exact: true },
  { label: "Payment Records", href: "/payments", icon: Receipt, exact: true },
  {
    label: "Receipts",
    href: "/payments/receipt",
    icon: FileCheck2,
    exact: false,
  },
  {
    label: "Outstanding",
    href: "/outstanding",
    icon: AlertTriangle,
    exact: true,
  },
  {
    label: "Resident Summary",
    href: "/outstanding/resident",
    icon: UserCheck,
    exact: false,
  },
  {
    label: "Payment Analytics",
    href: "/analytics",
    icon: TrendingUp,
    exact: false,
  },
  {
    label: "Report Center",
    href: "/finance/reports",
    icon: FileSpreadsheet,
    exact: false,
  },
  {
    label: "Service Management",
    href: "/services",
    icon: Wrench,
    exact: false,
  },
  {
    label: "Paystack Checkout",
    href: "/payments/checkout",
    icon: CreditCard,
    exact: false,
  },
  {
    label: "Estate Services",
    href: "/payments/estate-services",
    icon: Layers,
    exact: false,
  },
  {
    label: "Installments",
    href: "/payments/installments",
    icon: Split,
    exact: false,
  },
  {
    label: "Checkout Form",
    href: "/payments/paystack-form",
    icon: ShieldCheck,
    exact: false,
  },
];

export function isFinanceRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/finance") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/outstanding") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/services")
  );
}

export function isSubLinkActive(
  pathname: string | null,
  link: FinanceSubLink
): boolean {
  if (!pathname) return false;
  if (link.exact) {
    return pathname === link.href;
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export function FinanceSubNav() {
  const pathname = usePathname();

  if (!isFinanceRoute(pathname)) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs no-scrollbar print:hidden">
      {FINANCE_SUB_LINKS.map((link) => {
        const Icon = link.icon;
        const active = isSubLinkActive(pathname, link);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              active
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "text-dark/70 hover:bg-primary/5 hover:text-dark"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 flex-shrink-0 ${
                active ? "text-white" : "text-accent"
              }`}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
