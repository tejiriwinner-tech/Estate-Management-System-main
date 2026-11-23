"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { NewMemberInput } from "@/types/admin/member";

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
  const [saving, setSaving] = useState(false);
  const [houseNo, setHouseNo] = useState("");
  const [dateMovedIn, setDateMovedIn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setHouseNo("");
      setDateMovedIn("");
      setAvatarUrl("");
      setImageFileName("");
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
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
      setErrorMsg("Please enter the member's Full Name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      await onAddMember({
        name: fullName.trim(),
        email: email.trim(),
        house_no: houseNo.trim(),
        date_moved_in: dateMovedIn.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not add the member.");
    } finally {
      setSaving(false);
    }
  };

  const inputBaseClass =
    "w-full rounded-2xl border-[1.5px] border-primary/75 bg-primary-light/20 px-4 sm:px-6 py-3.5 sm:py-4 text-base sm:text-2xl font-normal text-dark placeholder:text-primary/85 focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all";

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-new-user-title"
        className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl px-5 sm:px-12 py-7 sm:py-10 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Centered Title */}
        <h2
          id="create-new-user-title"
          className="text-lg sm:text-2xl md:text-[28px] font-bold uppercase tracking-wide text-primary text-center mb-6 sm:mb-9"
        >
          CREATE NEW USER
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {errorMsg && (
            <div className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-xs sm:text-sm font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Full Name"
              aria-label="Full Name"
              className={inputBaseClass}
            />
          </div>

          {/* 1b. Email (needed to create the login) */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              className={inputBaseClass}
            />
          </div>

          {/* 2. House No */}
          <div>
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              placeholder="House No"
              aria-label="House No"
              className={inputBaseClass}
            />
          </div>

          {/* 3. Date Moved In */}
          <div>
            <input
              value={dateMovedIn}
              onChange={(e) => setDateMovedIn(e.target.value)}
              type="date"
              placeholder="Date Moved In"
              aria-label="Date Moved In"
              className={inputBaseClass}
            />
          </div>

          {/* 4. Upload Image */}
          <div>
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
              className={`${inputBaseClass} flex items-center justify-between text-left cursor-pointer hover:bg-primary-light/30`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-primary/90 truncate">
                  {imageFileName ? imageFileName : "Upload Image"}
                </span>
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent shrink-0 stroke-[2.2]" />
              </div>

              {avatarUrl && (
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-primary shrink-0">
                  <Image
                    src={avatarUrl}
                    alt="Uploaded member preview"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
            </button>
          </div>

          {/* Bottom Action Row: Cancel (Left) & Add Member (Right) */}
          <div className="pt-4 sm:pt-6 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-3.5 sm:gap-6">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[150px] sm:min-w-[200px] px-8 py-3.5 rounded-2xl bg-dark hover:bg-dark/90 text-white text-base sm:text-2xl font-medium shadow-sm transition-all active:scale-98 text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="min-w-[150px] sm:min-w-[200px] px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-base sm:text-2xl font-medium shadow-sm transition-all active:scale-98 text-center"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
