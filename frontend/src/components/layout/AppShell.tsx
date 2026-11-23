"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readSession } from "@/components/auth/session";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { FinanceSubNav } from "./FinanceSubNav";
import { MobileBottomNav } from "../mobile/MobileBottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

// Full-screen pages that render without the admin navbar / sidebar
const BARE_ROUTES = ["/login", "/agent-portal"];

export function AppShell({ children }: AppShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isBare = BARE_ROUTES.some((r) => pathname === r || pathname?.startsWith(`${r}/`));

  // Admin pages need a signed-in session; agents belong in their own portal
  useEffect(() => {
    if (isBare) return;
    const session = readSession();
    if (!session) {
      setAllowed(false);
      router.replace("/login");
    } else if (session.role === "Agent") {
      setAllowed(false);
      router.replace("/agent-portal");
    } else {
      setAllowed(true);
    }
  }, [isBare, pathname, router]);

  if (isBare) {
    return <>{children}</>;
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* Top Navbar with Mobile Hamburger */}
      <Navbar onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />

      {/* Slide-over Drawer for Mobile */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Body (Sidebar + Content) */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full pb-24 md:pb-8">
          <FinanceSubNav />
          {children}
        </main>
      </div>

      {/* Sticky Bottom Nav Bar for Mobile Screens */}
      <div className="md:hidden">
        <MobileBottomNav activeTab="finance" />
      </div>
    </div>
  );
}
