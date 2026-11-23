"use client";

// Figma "user settings": SMS Notification, Email Notification, All Members Can Chat With Me, Chang(e) Password.
import React, { useEffect, useState } from "react";
import { GreenButton, StateMsg } from "@/components/resident/ui";
import { Profile, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

type Key = "sms_notifications" | "email_notifications" | "members_can_chat";
const ROWS: { key: Key; label: string }[] = [
  { key: "sms_notifications", label: "SMS Notification" },
  { key: "email_notifications", label: "Email Notification" },
  { key: "members_can_chat", label: "All Members Can Chat With Me" },
];

export default function SettingsTab() {
  const { data, error, loading } = useResident<Profile>("/profile");
  const [s, setS] = useState<Record<Key, boolean> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pw, setPw] = useState<{ current_password: string; password: string; password_confirmation: string } | null>(null);
  useEffect(() => { if (data) setS(data.settings); }, [data]);

  const toggle = async (key: Key) => {
    if (!s) return;
    const next = { ...s, [key]: !s[key] };
    setS(next);
    try { await send("/settings", "PUT", { [key]: next[key] }); setMsg(null); }
    catch (e) { setS(s); setMsg(e instanceof Error ? e.message : "Could not save."); }
  };
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    try { await send("/change-password", "POST", pw); setPw(null); setMsg("Password changed."); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Could not change password."); }
  };

  return (
    <div>
      <StateMsg loading={loading} error={error} />
      {s && <ul className="space-y-6 py-4">
        {ROWS.map((r) => (
          <li key={r.key} className="flex items-center gap-4">
            <button role="switch" aria-checked={s[r.key]} aria-label={r.label} onClick={() => toggle(r.key)}
              className={`relative h-8 w-14 rounded-full transition ${s[r.key] ? "bg-brand" : "bg-muted/50"}`}>
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${s[r.key] ? "left-7" : "left-1"}`} />
            </button>
            <span className="text-lg">{r.label}</span>
          </li>
        ))}
      </ul>}
      {msg && <p role="status" className="mt-2 text-sm text-muted">{msg}</p>}
      <div className="mt-10"><GreenButton onClick={() => setPw({ current_password: "", password: "", password_confirmation: "" })}>Change Password</GreenButton></div>

      {pw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={changePw} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-brand">Change password</h2>
            {(["current_password", "password", "password_confirmation"] as const).map((k) => (
              <input key={k} required type="password" minLength={k === "current_password" ? 1 : 8} aria-label={k.replace("_", " ")} placeholder={k === "current_password" ? "Current password" : k === "password" ? "New password (8+ characters)" : "Confirm new password"}
                value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} className="w-full rounded-md border border-muted/50 px-3 py-2" />
            ))}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setPw(null)} className="rounded-md border border-muted/60 px-4 py-2">Cancel</button><GreenButton type="submit">Save</GreenButton></div>
          </form>
        </div>
      )}
    </div>
  );
}
