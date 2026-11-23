"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, Info } from "lucide-react";
import { LoginBackground } from "@/components/auth/LoginBackground";
import { RoleSelect, LoginRole } from "@/components/auth/RoleSelect";
import { ROLE_HOME, saveSession, toLoginRole } from "@/components/auth/session";
import { loginRequest } from "@/services/authApi";

type Errors = Partial<Record<"email" | "password" | "role", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<LoginRole | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const validate = (v = { email, password, role }): Errors => {
    const e: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
      e.email = "Enter a valid email address.";
    if (v.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!v.role) e.role = "Choose how you're signing in.";
    return e;
  };

  const revalidate = (patch: Partial<{ email: string; password: string; role: LoginRole | null }>) => {
    if (submitted) setErrors(validate({ email, password, role, ...patch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setNotice(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length || !role) return;

    setLoading(true);
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const { token, user } = await loginRequest(email.trim().toLowerCase(), password);
        const serverRole = toLoginRole(user.role);
        if (!serverRole) throw new Error("This account has no access to the app.");
        if (serverRole !== role) {
          throw new Error(`This account signs in as ${serverRole}, not ${role}.`);
        }
        saveSession({ email: user.email, role: serverRole, signedInAt: new Date().toISOString(), token });
        router.push(ROLE_HOME[serverRole]);
      } catch (err) {
        setErrors({ password: err instanceof Error ? err.message : "Sign-in failed." });
        setLoading(false);
      }
      return;
    }
    // Offline placeholder (no API configured): original behaviour.
    await new Promise((r) => setTimeout(r, 700));
    saveSession({ email: email.trim().toLowerCase(), role, signedInAt: new Date().toISOString() });
    router.push(ROLE_HOME[role]);
  };

  const socialSignIn = (provider: string) =>
    setNotice(`${provider} sign-in isn't connected yet. Please use your email and password.`);

  const inputBase =
    "w-full rounded-lg bg-primary-light px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-500 outline-none transition focus:bg-white focus:ring-2";
  const ring = (field: keyof Errors) =>
    errors[field] ? "ring-2 ring-rose-300 focus:ring-rose-300" : "focus:ring-primary/30";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <LoginBackground />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-lg ring-4 ring-white/25">
            <span className="font-serif text-2xl font-bold italic">LE</span>
          </div>
          <p className="mt-2.5 text-xl font-bold tracking-tight drop-shadow-sm">LincolnEstate</p>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl bg-white px-6 pb-7 pt-6 shadow-2xl sm:px-9">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-2xl">
              <span role="img" aria-label="Waving hand">👋</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-primary">Sign In</h1>
            <p className="mt-1 max-w-[290px] text-xs leading-relaxed text-slate-500">
              Welcome back to LincolnEstate. Sign in to keep managing your estate, payments and
              residents.
            </p>
          </div>

          {/* Social */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => socialSignIn("Facebook")}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-light px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-red-100"
            >
              <FacebookIcon /> Facebook
            </button>
            <button
              type="button"
              onClick={() => socialSignIn("Google")}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-light px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-red-100"
            >
              <GoogleIcon /> Google
            </button>
          </div>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            or
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          {notice && (
            <div role="status" className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  revalidate({ email: e.target.value });
                }}
                aria-invalid={!!errors.email}
                className={`${inputBase} ${ring("email")}`}
              />
              <FieldError msg={errors.email} />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    revalidate({ password: e.target.value });
                  }}
                  aria-invalid={!!errors.password}
                  className={`${inputBase} pr-11 ${ring("password")}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-white/60 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            <div>
              <RoleSelect
                value={role}
                hasError={!!errors.role}
                onChange={(r) => {
                  setRole(r);
                  revalidate({ role: r });
                }}
              />
              <FieldError msg={errors.role} />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNotice("Password reset isn't available yet. Please contact the estate admin.")}
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-80 sm:w-1/2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in…" : "Log in"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/80">
          © {new Date().getFullYear()} LincolnEstate. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500">
      <AlertCircle className="h-3 w-3" />
      {msg}
    </p>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#1877F2" />
      <path
        fill="#fff"
        d="M16.5 24v-9.3h3.1l.5-3.6h-3.6V8.8c0-1 .3-1.8 1.8-1.8h1.9V3.8c-.3 0-1.5-.1-2.8-.1-2.8 0-4.6 1.7-4.6 4.8v2.6H9.6v3.6h3.2V24h3.7z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}
