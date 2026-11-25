"use client";

// Shell for the resident app: luxury Post Army House Estate executive design system
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Compass,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserCheck,
  X,
} from "lucide-react";
import { clearSession, readSession } from "@/components/auth/session";
import { useRequireRole } from "@/components/auth/useRequireRole";
import { send } from "@/lib/resident/api";
import { useChatSummary } from "@/lib/chat/useChatSummary";
import { NotificationPopover } from "@/components/chat/NotificationPopover";

const NAV = [
  { href: "/resident", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/resident/activity", label: "Visitor Passes", icon: KeyRound },
  { href: "/resident/service-charges", label: "Service Charges", icon: CreditCard },
  { href: "/resident/store", label: "Estate Stores", icon: Store },
  { href: "/resident/messages", label: "Messages & Notices", icon: Mail },
  { href: "/resident/direction", label: "Estate Directions", icon: Compass },
  { href: "/resident/profile", label: "Profile & Settings", icon: UserCheck },
];

export function ResidentShell({ children }: { children: React.ReactNode }) {
  const allowed = useRequireRole(["User"]);
  const { summary, refresh } = useChatSummary();
  const unreadMessages = summary.unread_messages;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panic, setPanic] = useState<"idle" | "confirm" | "sent" | "error">("idle");
  const session = readSession();
  const email = session?.email ?? "";
  const name = session?.name ?? (email ? email.split("@")[0] : "Resident");

  if (!allowed) return null;

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  const sendPanic = async () => {
    try {
      await send("/panic", "POST", {});
      setPanic("sent");
    } catch {
      setPanic("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between gap-4 bg-white px-4 border-b border-gray-200/80 shadow-2xs lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/resident" className="flex items-center gap-3 group">
            {/* Monogram Logo */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#B22222] text-white font-bold text-lg shadow-md transition-transform group-hover:scale-105">
              <span className="tracking-tighter">LE</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#C9A227] rounded-full border-2 border-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-gray-900 leading-tight">
                Post Army House<span className="text-[#B22222]"> Estate</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#C9A227] uppercase">
                Resident Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Global Directory Search */}
        <label className="relative mx-auto hidden w-full max-w-md md:block">
          <span className="sr-only">Search directory and notices</span>
          <input
            placeholder="Search estate directory, notices, facilities..."
            className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3.5 py-2 pr-9 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:bg-white transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </label>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <NotificationPopover
            unread={summary.unread_total}
            onChanged={refresh}
            onSeeAll={() => router.push("/resident/messages")}
          />

          <Link
            href="/resident/profile"
            aria-label="My profile"
            title={email}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2] border border-[#B22222]/20 text-xs font-bold text-[#B22222] shadow-2xs">
              {email.slice(0, 2).toUpperCase() || "RE"}
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">{name}</p>
              <p className="text-[10px] font-medium text-slate-500">Villa A-402</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed bottom-0 left-0 top-20 z-40 flex w-64 flex-col bg-white p-4 border-r border-gray-200/80 shadow-xs transition-transform lg:z-20 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          aria-label="Close menu"
          className="mb-2 self-end text-slate-500 hover:text-gray-900 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#B22222] text-white shadow-xs"
                    : "text-slate-600 hover:text-gray-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-[#C9A227]" : "text-slate-400"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {label === "Messages & Notices" && unreadMessages > 0 && (
                  <span className="ml-auto rounded-full bg-[#B22222] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Emergency & Logout */}
        <div className="mt-auto pt-4 space-y-2 border-t border-gray-100">
          <button
            onClick={() => setPanic("confirm")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-[#B22222] hover:text-white transition-all shadow-xs group"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
            <span>SOS Emergency Alert</span>
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="px-4 pb-12 pt-28 lg:ml-64 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* SOS Panic Modal */}
      {panic !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100"
          >
            {panic === "confirm" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 border border-red-100">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Transmit SOS Panic Alert?
                </h2>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Post Army House Estate Central Security Command and patrol officers will immediately receive your unit coordinates (Villa A-402) with emergency priority.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setPanic("idle")}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendPanic}
                    className="flex-1 rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B] shadow-md transition-colors"
                  >
                    Dispatch Security
                  </button>
                </div>
              </>
            )}
            {panic === "sent" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Security Dispatched
                </h2>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Gate 1 and Mobile Patrol Sector 2 have been alerted to Villa A-402. Remain in a safe position. Response team is en route.
                </p>
                <button
                  onClick={() => setPanic("idle")}
                  className="mt-6 w-full rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B] shadow-sm transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
            {panic === "error" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-extrabold text-red-700">
                  Transmission Offline
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Could not reach central server. Please contact Security Desk directly at <strong>+234 800-LINCOLN</strong>.
                </p>
                <button
                  onClick={() => setPanic("idle")}
                  className="mt-6 w-full rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
