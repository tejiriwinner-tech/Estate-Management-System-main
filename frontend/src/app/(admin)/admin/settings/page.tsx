"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { readSession, saveSession } from "@/components/auth/session";

export default function AdminSettingsPage() {
  const session = readSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: session?.name || "Administrator",
    email: session?.email || "admin@lincolnestate.ng",
    phone: "",
    job_title: "Estate Manager",
    avatar_url: "",
  });

  const [settings, setSettings] = useState({
    estate_name: "Post Army Housing Estate",
    support_phone: "",
    default_due_days: 14,
    auto_approve_listings: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/profile", {
        headers: session?.email ? { "x-user-email": session.email } : {},
        cache: "no-store",
      });
      const json = await res.json();
      if (json?.data?.profile) {
        setProfile({
          name: json.data.profile.name || "Administrator",
          email: json.data.profile.email || session?.email || "",
          phone: json.data.profile.phone || "",
          job_title: json.data.profile.job_title || "Estate Manager",
          avatar_url: json.data.profile.avatar_url || "",
        });
      }
      if (json?.data?.settings) {
        setSettings({
          estate_name: json.data.settings.estate_name || "Post Army Housing Estate",
          support_phone: json.data.settings.support_phone || "",
          default_due_days: Number(json.data.settings.default_due_days || 14),
          auto_approve_listings: Boolean(json.data.settings.auto_approve_listings),
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session?.email]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be under 2MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((prev) => ({ ...prev, avatar_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.email ? { "x-user-email": session.email } : {}),
        },
        body: JSON.stringify({
          ...profile,
          new_password: newPassword || undefined,
          settings,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save settings.");

      if (session) {
        saveSession({
          ...session,
          name: profile.name,
        });
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("pahe-admin-profile-updated", {
            detail: { name: profile.name, job_title: profile.job_title, avatar_url: profile.avatar_url },
          })
        );
      }

      setNewPassword("");
      setConfirmPassword("");
      setToast("Administrator profile and estate settings saved successfully.");
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setError(err?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Admin Profile &amp; Settings</h1>
        <p className="text-sm text-muted">
          Manage your administrator profile photo, credentials, and Post Army Housing Estate operations preferences.
        </p>
      </div>

      {toast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center text-xs text-slate-400">
          Loading administrator settings...
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Profile Photo & Identity */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center gap-5 pb-5 border-b border-slate-100">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#C9A227] bg-slate-100 flex items-center justify-center shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-extrabold text-slate-900">Administrator Profile Photo</h2>
                <p className="text-xs text-slate-500">
                  Displayed in the top navigation bar across the Admin Dashboard (PNG/JPG, max 2MB).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] hover:bg-[#991B1B] px-3.5 py-2 text-xs font-extrabold text-white cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {profile.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, avatar_url: "" }))}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Title</label>
                <input
                  value={profile.job_title}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  placeholder="Estate Manager"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#B22222]" />
                  <span>Admin Email</span>
                </label>
                <input
                  disabled
                  value={profile.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Contact Phone</span>
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Estate Operations Controls */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#B22222]" />
              <h2 className="text-base font-extrabold text-slate-900">Estate Operations Preferences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estate Name</label>
                <input
                  value={settings.estate_name}
                  onChange={(e) => setSettings({ ...settings, estate_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estate Support Hotline</label>
                <input
                  value={settings.support_phone}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  placeholder="+234 800..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Service Charge Due (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.default_due_days}
                  onChange={(e) => setSettings({ ...settings, default_due_days: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Require Admin Approval for Agent Listings</p>
                  <p className="text-[11px] text-slate-500">Recommended for quality control</p>
                </div>
                <input
                  type="checkbox"
                  checked={!settings.auto_approve_listings}
                  onChange={(e) => setSettings({ ...settings, auto_approve_listings: !e.target.checked })}
                  className="h-4 w-4 accent-[#B22222]"
                />
              </div>
            </div>
          </div>

          {/* Security / Password */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">Account Security</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>New Password (leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] hover:bg-[#991B1B] px-6 py-3 text-xs font-extrabold text-white shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile & Settings"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
