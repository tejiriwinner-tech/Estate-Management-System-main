"use client";

import React from "react";
import Link from "next/link";
import { Home, FileText, Wallet, LayoutGrid } from "lucide-react";

interface ManagementBottomNavProps {
  activeTab?: "home" | "reports" | "finance" | "more";
}

export function ManagementBottomNav({ activeTab = "home" }: ManagementBottomNavProps) {
  const tabs = [
    { id: "home", label: "Home", href: "/management", icon: Home },
    { id: "reports", label: "Reports", href: "/reports", icon: FileText },
    { id: "finance", label: "Finance", href: "/finance", icon: Wallet },
    { id: "more", label: "More", href: "/staffs", icon: LayoutGrid },
  ];

  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-2.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1 text-[10px] font-bold transition-colors ${
              isActive ? "text-primary" : "text-slate-500 hover:text-dark"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                isActive ? "text-primary fill-primary/15" : "text-accent"
              }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
