"use client";

// Shell for the resident app, laid out like the Figma frames: top bar (logo, search, bell, avatar),
// left sidebar (Dashboard, Finance, Marketplace, Messages, Direction, Logout) and the red panic button.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Compass, LayoutDashboard, LogOut, Mail, Menu, Search, Store, Wallet, X } from "lucide-react";
import { clearSession, readSession } from "@/components/auth/session";
import { useRequireRole } from "@/components/auth/useRequireRole";
import { send } from "@/lib/resident/api";
import { useChatSummary } from "@/lib/chat/useChatSummary";
import { NotificationPopover } from "@/components/chat/NotificationPopover";

const NAV = [
  { href: "/resident", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/store-app", label: "Marketplace", icon: Store },
  { href: "/resident/messages", label: "Messages", icon: Mail },
  { href: "/resident/direction", label: "Direction", icon: Compass },
];

export function ResidentShell({ children }: { children: React.ReactNode }) {
  const allowed = useRequireRole(["User"]);
  const { summary, refresh } = useChatSummary();
  const unreadMessages = summary.unread_messages;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panic, setPanic] = useState<"idle" | "confirm" | "sent" | "error">("idle");
  const email = readSession()?.email ?? "";

  if (!allowed) return null;

  const logout = () => { clearSession(); router.replace("/login"); };
  const sendPanic = async () => {
    try { await send("/panic", "POST", {}); setPanic("sent"); } catch { setPanic("error"); }
  };

  return (
    <div className="min-h-full bg-page">
      <header className="fixed inset-x-0 top-0 z-30 flex h-20 items-center gap-4 bg-white px-4 shadow-[0_1px_30px_#cafad5] lg:px-6">
        <button aria-label="Open menu" className="text-brand lg:hidden" onClick={() => setOpen(true)}><Menu className="h-6 w-6" /></button>
        <Link href="/resident" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">LE</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-2xl font-extrabold text-brand">LincolnEstate</span>
            <span className="block text-xs font-semibold text-brand">Resident Dashboard</span>
          </span>
        </Link>
        <label className="relative mx-auto hidden w-full max-w-md md:block">
          <span className="sr-only">Search</span>
          <input placeholder="Search..." className="w-full rounded-md border border-brand/40 bg-mint px-3 py-2 pr-9 text-xs text-brand placeholder:text-brand focus:outline-none focus:ring-2 focus:ring-brand" />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
        </label>
        <div className="ml-auto flex items-center gap-4">
          <NotificationPopover unread={summary.unread_total} onChanged={refresh} onSeeAll={() => router.push("/resident/messages")} />
          <Link href="/resident/profile" aria-label="My profile" title={email} className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-sm font-bold text-brand">
            {email.slice(0, 2).toUpperCase() || "ME"}
          </Link>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed bottom-0 left-0 top-20 z-40 flex w-72 flex-col bg-white p-5 shadow-[0_4px_9px_#cafad5] transition-transform lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <button aria-label="Close menu" className="mb-2 self-end text-brand lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        <nav className="space-y-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`relative flex items-center gap-4 rounded-md px-4 py-3 text-lg font-bold text-white transition ${active ? "bg-brand ring-2 ring-brand-dark" : "bg-brand hover:bg-brand-dark"}`}>
                <Icon className="h-6 w-6" />
                {label}
                {label === "Messages" && unreadMessages > 0 && <span className="ml-auto rounded bg-alert px-1.5 text-[10px] font-semibold">{unreadMessages}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <button onClick={() => setPanic("confirm")} className="w-full rounded-lg bg-panic px-4 py-3 text-lg font-semibold text-white hover:opacity-90">life under threat</button>
          <button onClick={logout} className="flex w-full items-center justify-center gap-3 text-xl font-bold text-brand"><LogOut className="h-6 w-6 -scale-x-100" />Logout</button>
        </div>
      </aside>

      <main className="px-4 pb-12 pt-28 lg:ml-72 lg:px-10">{children}</main>

      {panic !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            {panic === "confirm" && (<>
              <h2 className="text-lg font-bold text-panic">Send a panic alert?</h2>
              <p className="mt-2 text-sm text-muted">Estate security will be told your unit and that your life is under threat.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setPanic("idle")} className="flex-1 rounded-md border border-muted/50 py-2 text-sm font-semibold">Cancel</button>
                <button onClick={sendPanic} className="flex-1 rounded-md bg-panic py-2 text-sm font-semibold text-white">Send alert</button>
              </div>
            </>)}
            {panic === "sent" && (<><h2 className="text-lg font-bold text-brand">Security has been alerted</h2><p className="mt-2 text-sm text-muted">Stay where it is safe. Help is on the way.</p><button onClick={() => setPanic("idle")} className="mt-5 w-full rounded-md bg-brand py-2 text-sm font-semibold text-white">Close</button></>)}
            {panic === "error" && (<><h2 className="text-lg font-bold text-panic">The alert did not go through</h2><p className="mt-2 text-sm text-muted">Call the security desk directly.</p><button onClick={() => setPanic("idle")} className="mt-5 w-full rounded-md border border-muted/50 py-2 text-sm font-semibold">Close</button></>)}
          </div>
        </div>
      )}
    </div>
  );
}
