"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Home,
  Users,
  CalendarClock,
  Wallet,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { clearSession, readSession } from "@/components/auth/session";
import { initialsFor } from "@/components/agents/initials";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";

export interface PortalAgent {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  email: string;
  zone: string;
}

const PortalAgentContext = createContext<PortalAgent | null>(null);

/** The agent who is signed in to the portal. */
export function usePortalAgent(): PortalAgent {
  const agent = useContext(PortalAgentContext);
  if (!agent) throw new Error("usePortalAgent must be used inside AgentPortalShell");
  return agent;
}

const NAV = [
  { label: "Overview", href: "/agent-portal?tab=overview", tab: "overview", icon: LayoutGrid },
  { label: "My Listings", href: "/agent-portal?tab=listings", tab: "listings", icon: Home },
  { label: "Client Requests", href: "/agent-portal?tab=requests", tab: "requests", icon: Users },
  { label: "Viewings", href: "/agent-portal?tab=viewings", tab: "viewings", icon: CalendarClock },
  { label: "Earnings", href: "/agent-portal?tab=earnings", tab: "earnings", icon: Wallet },
  { label: "Messages & Notices", href: "/agent-portal/messages", tab: "", icon: MessageSquare },
];

function resolveAgent(email: string): PortalAgent {
  const local = email.split("@")[0] ?? "agent";
  const name =
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(" ") || "Agent";
  return {
    id: "",
    name,
    firstName: name.split(" ")[0],
    initials: initialsFor(name) || "AG",
    email,
    zone: "",
  };
}

export function AgentPortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { summary, refresh } = useChatSummary();
  const [agent, setAgent] = useState<PortalAgent | null>(null);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = readSession();
    if (!session || session.role !== "Agent") {
      router.replace("/login");
      return;
    }
    setAgent(resolveAgent(session.email));
  }, [router]);

  useEffect(() => {
    if (pathname !== "/agent-portal") return;
    const syncTab = () => {
      const sp = new URLSearchParams(window.location.search);
      setActive(sp.get("tab") || "overview");
    };
    syncTab();
    window.addEventListener("popstate", syncTab);
    return () => window.removeEventListener("popstate", syncTab);
  }, [pathname]);

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PortalAgentContext.Provider value={agent}>
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
          <div className="flex h-16 items-center justify-between px-4 sm:px-8">
            <Link href="/agent-portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow-sm shadow-primary/20">
                <span>PAHE</span>
              </div>
              <div>
                <p className="text-sm font-extrabold leading-tight tracking-tight text-dark">
                  Post Army <span className="text-primary">Housing Estate</span>
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-accent-dark">
                  Agent Portal
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationPopover
                unread={summary.unread_total}
                onSeeAll={() => router.push("/agent-portal/messages")}
                onChanged={refresh}
              />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-tight text-dark">{agent.name}</p>
                <p className="text-[11px] font-medium text-slate-400">
                  Letting Agent {agent.id ? `· ${agent.id}` : ""}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark text-xs font-bold text-white ring-2 ring-accent">
                {agent.initials}
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="rounded-lg p-2 text-slate-500 hover:bg-primary-light hover:text-primary md:hidden"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md shadow-lg md:hidden">
          {NAV.map((item) => {
            const isActive = item.tab
              ? pathname === "/agent-portal" && active === item.tab
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => item.tab && setActive(item.tab)}
                className={`flex flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[9px] font-bold transition-all ${
                  isActive ? "text-primary font-extrabold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
                    isActive ? "bg-primary text-white scale-110 shadow-sm shadow-primary/30" : "bg-transparent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="truncate max-w-[54px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 flex-shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-4 py-6 md:flex">
            <nav className="space-y-1.5">
              {NAV.map((item) => {
                const isActive = item.tab
                  ? pathname === "/agent-portal" && active === item.tab
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => item.tab && setActive(item.tab)}
                    className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "text-dark/70 hover:bg-primary/5 hover:text-dark"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-accent group-hover:text-primary"}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>

          <main className="w-full max-w-[1500px] flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">{children}</main>
        </div>
      </div>
    </PortalAgentContext.Provider>
  );
}
