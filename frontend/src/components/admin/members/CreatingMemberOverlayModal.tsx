"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, UserPlus, X, ShieldCheck, Building2, Phone, Mail, KeyRound } from "lucide-react";
import { NewMemberInput } from "@/types/admin/member";
import { AGENT_ZONES } from "@/types/agent";

interface CreatingMemberOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (payload: NewMemberInput) => Promise<void>;
}

export function CreatingMemberOverlayModal({
  isOpen,
  onClose,
  onAddMember,
}: CreatingMemberOverlayModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState<string>(AGENT_ZONES[0]);
  const [houseNo, setHouseNo] = useState("");
  const [residencyType, setResidencyType] = useState("Homeowner");
  const [dateMovedIn, setDateMovedIn] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setPhone("");
      setZone(AGENT_ZONES[0]);
      setHouseNo("");
      setResidencyType("Homeowner");
      setDateMovedIn(new Date().toISOString().split("T")[0]);
      setPassword("");
      setAvatarUrl("");
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Profile photo must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter the resident's Full Name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!houseNo.trim()) {
      setErrorMsg("Please enter the House / Villa number.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await onAddMember({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        zone,
        house_no: houseNo.trim(),
        residency_type: residencyType,
        date_moved_in: dateMovedIn.trim(),
        password: password.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not add the resident.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222] transition-all";
  const labelClass = "block text-[11px] font-bold text-slate-700 mb-1";

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-new-user-title"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B22222]">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Post Army Housing Estate Registry</span>
            </div>
            <h2 id="create-new-user-title" className="text-lg font-extrabold text-slate-900 mt-0.5">
              Register New Resident
            </h2>
            <p className="text-xs text-slate-500">
              Creates a verified resident profile and portal login credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div role="alert" className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Avatar Upload Strip */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-16 h-16 rounded-full bg-white border-2 border-[#B22222]/25 overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Resident preview" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">Resident Identification Photo</p>
              <p className="text-[11px] text-slate-500">
                Used by Security Command &amp; Admin for gate verification (optional, PNG/JPG up to 2MB).
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 shrink-0 shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-[#B22222]" />
              <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
            </button>
          </div>

          {/* Detailed 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Col. Chinedu Okafor"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#B22222]" /> Email Address *
                </span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@postarmyhouse.ng"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#C9A227]" /> Phone Number
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 000 0000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Residency Type
                </span>
              </label>
              <select
                value={residencyType}
                onChange={(e) => setResidencyType(e.target.value)}
                className={inputClass}
              >
                <option value="Homeowner">Homeowner / Landlord</option>
                <option value="Tenant">Verified Tenant</option>
                <option value="Household Member">Household Member</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Estate Sector / Phase</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className={inputClass}
              >
                {AGENT_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#B22222]" /> House / Villa No. *
                </span>
              </label>
              <input
                type="text"
                required
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                placeholder="e.g. Villa A-402 or Plot 12"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Date Moved In</label>
              <input
                type="date"
                value={dateMovedIn}
                onChange={(e) => setDateMovedIn(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#B22222]" /> Initial Login Password
                </span>
              </label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for default password"
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{saving ? "Registering…" : "Register Resident"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
