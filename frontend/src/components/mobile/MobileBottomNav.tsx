"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Wallet, Store, MessageSquare, Menu } from "lucide-react";

interface MobileBottomNavProps {
  activeTab?: "dashboard" | "finance" | "store" | "messages" | "more";
}

export function MobileBottomNav({ activeTab = "dashboard" }: MobileBottomNavProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/management", icon: LayoutGrid },
    { id: "finance", label: "Finance", href: "/finance", icon: Wallet },
    { id: "store", label: "Store", href: "/outstanding/resident", icon: Store },
    { id: "messages", label: "Messages", href: "/payments", icon: MessageSquare, hasBadge: true },
    { id: "more", label: "More", href: "/staffs", icon: Menu },
  ];

  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white/95 backdrop-blur-md px-2 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-bold transition-colors ${
              isActive ? "text-primary" : "text-slate-500 hover:text-dark"
            }`}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-primary fill-primary/10" : "text-accent"
                }`}
              />
              {tab.hasBadge && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
              )}
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
