"use client";

import { useState } from "react";
import Sidebar from "@/components/security/layout/Sidebar";
import Header from "@/components/security/layout/Header";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/security/utils";
import { useRequireRole } from "@/components/auth/useRequireRole";

const PAGE_TITLES: Record<string, string> = {
  "/security/dashboard":    "Dashboard",
  "/security/hq":           "Security Management HQ",
  "/security/messages":     "Messages",
  "/security/emergency":    "Emergency Alerts",
  "/security/intelligence": "Intelligence Feed",
  "/security/access":       "Access Control",
  "/security/blacklist":    "Blacklist Management",
  "/security/members":      "Security Members",
  "/security/reports":      "Reports",
  "/security/about":        "About",
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const allowed = useRequireRole(["Security", "Admin"]);
  const title = PAGE_TITLES[pathname] ?? "Security";
  if (!allowed) return null;

  return (
    <div className="flex h-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 lg:static lg:z-auto lg:flex transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[--color-bg]">
          {children}
        </main>
      </div>
    </div>
  );
}
