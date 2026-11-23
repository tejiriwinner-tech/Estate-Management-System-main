"use client";

// Bell dropdown from the "notification ol" frame: rows of avatar + title + time, and an
// underlined "See All Notification" footer.
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { chatApi, fmtClock, type AppNotification } from "@/lib/chat/api";
import { Avatar } from "./Avatar";

export function NotificationPopover({ unread = 0, onSeeAll, onChanged }: { unread?: number; onSeeAll?: () => void; onChanged?: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setItems((await chatApi.notifications()).items.slice(0, 4)); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load notifications"); }
  }, []);
  useEffect(() => { if (open) load(); }, [open, load]);

  const markAndClose = async (n: AppNotification) => {
    if (!n.read) { await chatApi.readNotification(n.id).catch(() => {}); onChanged?.(); }
    setOpen(false);
    onSeeAll?.();
  };

  return (
    <div className="relative">
      <button aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-xl text-slate-500 hover:text-[#B22222] hover:bg-slate-100 transition-colors">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#B22222] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label="Notifications" className="absolute right-0 top-11 z-50 w-[min(380px,92vw)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-4 py-3 font-bold text-gray-900 text-sm flex items-center justify-between">
              <span>Notifications</span>
              {unread > 0 && <span className="text-xs text-[#B22222] font-semibold">{unread} unread</span>}
            </div>
            {error && <p className="p-4 text-xs text-red-600">{error}</p>}
            {!error && items.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No notifications yet.</p>}
            {items.map((n) => (
              <button key={n.id} onClick={() => markAndClose(n)} className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${n.read ? "bg-white" : "bg-[#FEF2F2]/60"}`}>
                <Avatar name={n.title} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-gray-900">{n.title}</span>
                  <span className="block text-[11px] font-medium text-slate-400">{fmtClock(n.created_at)}</span>
                </span>
              </button>
            ))}
            <button onClick={() => { setOpen(false); onSeeAll?.(); }} className="w-full py-2.5 text-center text-xs font-bold text-[#B22222] hover:bg-[#FEF2F2] transition-colors">See All Notifications</button>
          </div>
        </>
      )}
    </div>
  );
}
