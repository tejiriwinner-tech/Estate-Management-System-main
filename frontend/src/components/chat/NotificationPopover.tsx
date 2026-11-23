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
      <button aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative text-[#0ca348]">
        <Bell className="h-6 w-6" />
        {unread > 0 && <span className="absolute -right-2 -top-2 rounded bg-[#ea4335] px-1 text-[10px] font-semibold text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label="Notifications" className="absolute right-0 top-9 z-50 w-[min(406px,92vw)] overflow-hidden bg-white shadow-xl">
            {error && <p className="p-4 text-sm text-[#ea4335]">{error}</p>}
            {!error && items.length === 0 && <p className="p-6 text-center text-sm text-[#9f9c9c]">No notifications yet.</p>}
            {items.map((n) => (
              <button key={n.id} onClick={() => markAndClose(n)} className={`flex w-full items-start gap-3 border-b border-black px-4 py-3 text-left ${n.read ? "bg-white" : "bg-[#f4fdf6]"}`}>
                <Avatar name={n.title} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-black">{n.title}</span>
                  <span className="block text-sm font-bold text-[#9f9c9c]">{fmtClock(n.created_at)}</span>
                </span>
              </button>
            ))}
            <button onClick={() => { setOpen(false); onSeeAll?.(); }} className="w-full py-3 text-center text-base font-bold text-black underline">See All Notification</button>
          </div>
        </>
      )}
    </div>
  );
}
