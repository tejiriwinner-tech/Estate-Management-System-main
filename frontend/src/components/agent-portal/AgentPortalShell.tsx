"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Home,
  Users,
  CalendarClock,
  Wallet,
  LogOut,
  Bell,
} from "lucide-react";
import { clearSession, readSession } from "@/components/auth/session";
import { initialsFor } from "@/components/agents/initials";

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
  { label: "Overview", href: "#overview", icon: LayoutGrid },
  { label: "My Listings", href: "#listings", icon: Home },
  { label: "Client Requests", href: "#requests", icon: Users },
  { label: "Viewings", href: "#viewings", icon: CalendarClock },
  { label: "Earnings", href: "#earnings", icon: Wallet },
];

/** Build the signed-in agent's display profile from their email (the portal page shows the real name from the API). */
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
  const [agent, setAgent] = useState<PortalAgent | null>(null);
  const [active, setActive] = useState("#overview");

  // Only agents may open the portal
  useEffect(() => {
    const session = readSession();
    if (!session || session.role !== "Agent") {
      router.replace("/login");
      return;
    }
    setAgent(resolveAgent(session.email));
  }, [router]);

  // Highlight the section currently in view
  useEffect(() => {
    if (!agent) return;
    const update = () => {
      // The active section is the last one whose top has scrolled past the sticky header
      const line = 140;
      let current = NAV[0].href;
      for (const n of NAV) {
        const el = document.querySelector(n.href);
        if (el && el.getBoundingClientRect().top <= line) current = n.href;
      }
      // Near the page bottom the last section may never reach the line
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = NAV[NAV.length - 1].href;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [agent]);

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
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-sm shadow-primary/20">
                <span className="font-serif italic">LE</span>
              </div>
              <div>
                <p className="text-base font-bold leading-tight tracking-tight">
                  <span className="text-primary">Lincoln</span>
                  <span className="text-dark">Estate</span>
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-accent-dark">
                  Agent Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-tight text-dark">{agent.name}</p>
                <p className="text-[11px] font-medium text-slate-400">
                  Letting Agent · {agent.id}
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

          {/* Mobile section tabs */}
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  active === item.href ? "bg-primary text-white" : "text-slate-500"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 flex-shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-4 py-6 md:flex">
            <nav className="space-y-1.5">
              {NAV.map((item) => {
                const isActive = active === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "text-dark/70 hover:bg-primary/5 hover:text-dark"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-accent group-hover:text-primary"}`}
                    />
                    {item.label}
                  </a>
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

          <main className="w-full max-w-[1500px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </PortalAgentContext.Provider>
  );
}
