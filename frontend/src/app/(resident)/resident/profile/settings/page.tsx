"use client";

import React, { useEffect, useState } from "react";
import { Camera, CheckCircle2, KeyRound, Save, User, Bell } from "lucide-react";
import { Profile, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";
import { readSession } from "@/components/auth/session";

type Key = "sms_notifications" | "email_notifications" | "members_can_chat";
const ROWS: { key: Key; label: string; desc: string }[] = [
  { key: "sms_notifications", label: "SMS Notification", desc: "Receive gate clearance and security SMS alerts" },
  { key: "email_notifications", label: "Email Notification", desc: "Receive monthly service charge invoices and notices" },
  { key: "members_can_chat", label: "All Members Can Chat With Me", desc: "Allow verified estate neighbors to send direct messages" },
];

export default function SettingsTab() {
  const { data, error, loading, reload } = useResident<Profile>("/profile");
  const session = readSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [s, setS] = useState<Record<Key, boolean> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pw, setPw] = useState<{ current_password: string; password: string; password_confirmation: string } | null>(null);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setPhone(data.phone || "");
      setUnitNumber(data.unit_number || "");
      setAvatarUrl(data.avatar_url || null);
      setS(data.settings);
    }
  }, [data]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg("Profile photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMsg(null);
    try {
      await send("/profile", "PUT", {
        email: session?.email || data?.email,
        name: name.trim(),
        phone: phone.trim(),
        unit_number: unitNumber.trim(),
        avatar_url: avatarUrl,
      });
      await reload();
      setMsg("Profile & photo saved! Admin and Security can now view your updated photo.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggle = async (key: Key) => {
    if (!s) return;
    const next = { ...s, [key]: !s[key] };
    setS(next);
    try {
      await send("/settings", "PUT", { [key]: next[key] });
      setMsg(null);
    } catch (e) {
      setS(s);
      setMsg(e instanceof Error ? e.message : "Could not save.");
    }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    try {
      await send("/change-password", "POST", pw);
      setPw(null);
      setMsg("Password changed successfully.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not change password.");
    }
  };

  if (loading && !data) {
    return <div className="py-8 text-center text-xs text-slate-400">Loading settings…</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {msg && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 1. Profile Photo & Identity */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
          <User className="w-4 h-4 text-[#B22222]" />
          <span>Profile Photo &amp; Personal Details</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative h-20 w-20 rounded-full border-2 border-[#B22222]/30 bg-white overflow-hidden flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#B22222]">{(name || "R").slice(0, 1)}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs">
              <Camera className="w-4 h-4 text-[#B22222]" />
              <span>Upload Profile Picture</span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-500">
              Visible to Estate Admin &amp; Gate Security for fast identity verification (PNG/JPG up to 2MB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Villa Number</label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? "Saving…" : "Save Profile & Photo"}</span>
          </button>
        </div>
      </form>

      {/* 2. Notification Preferences */}
      {s && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
            <Bell className="w-4 h-4 text-[#C9A227]" />
            <span>Notification &amp; Privacy Preferences</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {ROWS.map((r) => (
              <li key={r.key} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{r.label}</p>
                  <p className="text-[11px] text-slate-500">{r.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s[r.key]}
                  aria-label={r.label}
                  onClick={() => void toggle(r.key)}
                  className={`relative h-7 w-12 rounded-full transition shrink-0 ${s[r.key] ? "bg-[#B22222]" : "bg-slate-300"}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-xs transition-all ${s[r.key] ? "left-5.5" : "left-0.5"}`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Account Security */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-sm font-extrabold text-gray-900">Account Password</p>
          <p className="text-xs text-slate-500">Update your login password regularly to protect your resident portal.</p>
        </div>
        <button
          type="button"
          onClick={() => setPw({ current_password: "", password: "", password_confirmation: "" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
        >
          <KeyRound className="w-4 h-4 text-[#C9A227]" />
          <span>Change Password</span>
        </button>
      </div>

      {pw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={changePw} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-extrabold text-gray-900">Change Password</h2>
            {(["current_password", "password", "password_confirmation"] as const).map((k) => (
              <input
                key={k}
                required
                type="password"
                minLength={k === "current_password" ? 1 : 8}
                aria-label={k.replace("_", " ")}
                placeholder={
                  k === "current_password"
                    ? "Current password"
                    : k === "password"
                    ? "New password (8+ characters)"
                    : "Confirm new password"
                }
                value={pw[k]}
                onChange={(e) => setPw({ ...pw, [k]: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
              />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPw(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-[#B22222] px-4 py-2 text-xs font-bold text-white">
                Save Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
