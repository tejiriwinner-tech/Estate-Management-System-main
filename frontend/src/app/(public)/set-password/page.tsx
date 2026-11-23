"use client";

// Opened from the e-mailed link an admin-created account receives (KAN-14).
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { setPasswordRequest } from "@/services/authApi";

function Form() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setMsg({ ok: false, text: "The two passwords do not match." });
    try {
      await setPasswordRequest({ email, token, password, password_confirmation: confirm });
      setMsg({ ok: true, text: "Password saved." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "This link is invalid or has expired." });
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl">
      <h1 className="text-xl font-bold text-primary">Set your password</h1>
      <p className="text-xs text-slate-500">{email}</p>
      <input type="password" aria-label="New password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
      <input type="password" aria-label="Confirm password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
      <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover">Save password</button>
      {msg && <p role="status" className={`text-xs font-medium ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.text}</p>}
      {msg?.ok && <Link href="/login" className="block text-center text-sm font-bold text-primary">Go to sign in</Link>}
    </form>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}><Form /></Suspense>
    </div>
  );
}
