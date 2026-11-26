"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/security/layout/Sidebar";
import Header from "@/components/security/layout/Header";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/security/utils";
import { useRequireRole } from "@/components/auth/useRequireRole";
import { parseCodedAlert } from "@/lib/emergencyCodes";
import { AlertTriangle, MapPin, Radio, ArrowRight } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/security/dashboard": "Dashboard",
  "/security/hq": "Security Management HQ",
  "/security/messages": "Messages & Alerts",
  "/security/emergency": "Emergency Alerts",
  "/security/intelligence": "Intelligence Feed",
  "/security/access": "Access Control",
  "/security/blacklist": "Blacklist Records",
  "/security/members": "Security Officers",
  "/security/reports": "Incident Reports",
  "/security/reports/activity": "Incident Reports",
  "/security/about": "Station Info",
};

interface LiveEmergency {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at: string;
}

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeEmergencies, setActiveEmergencies] = useState<LiveEmergency[]>([]);
  const pathname = usePathname();
  const allowed = useRequireRole(["Security", "Admin"]);
  const title = PAGE_TITLES[pathname] ?? "Security Command";

  const pollEmergencies = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/security/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setActiveEmergencies(json?.data?.activeEmergencies || []);
    } catch {
      // ignore transient network errors
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void pollEmergencies();
    const t = setInterval(pollEmergencies, 4000);
    return () => clearInterval(t);
  }, [allowed, pollEmergencies]);

  if (!allowed) return null;

  const latest = activeEmergencies[0];
  const parsed = latest ? parseCodedAlert(latest.message) : null;

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
        <Sidebar activeEmergencyCount={activeEmergencies.length} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        {latest && parsed && (
          <div className="bg-red-700 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-red-800">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-red-700 px-2.5 py-0.5 text-[11px] font-extrabold animate-pulse shrink-0">
                <Radio className="w-3.5 h-3.5" />
                {parsed.spec.label}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold truncate">
                  {parsed.spec.title} — {parsed.sender} ({parsed.role})
                </p>
                <p className="text-[11px] text-red-100 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>Location: {latest.location}</span>
                  {activeEmergencies.length > 1 && (
                    <span className="ml-2 font-bold text-[#C9A227]">
                      +{activeEmergencies.length - 1} more active
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/security/emergency"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50 transition-colors shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Respond Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-[--color-bg]">
          {children}
        </main>
      </div>
    </div>
  );
}
