"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";

interface CreatingStaffOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStaff: Partial<StaffMember>) => void;
}

export function CreatingStaffOverlayModal({
  isOpen,
  onClose,
  onSave,
}: CreatingStaffOverlayModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setStaffId("");
      setRole("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter the staff member's Full Name.");
      return;
    }

    const cleanName = fullName.trim();
    const cleanId = staffId.trim() || "LES001";
    const cleanRole = role.trim() || "Staff";

    onSave({
      name: cleanName,
      staff_id: cleanId,
      role: cleanRole.toLowerCase(),
      job_title: cleanRole,
      department: "Operations",
      email: `${cleanName.toLowerCase().replace(/\s+/g, ".")}@lincolnestate.com`,
      status: "active",
      avatar_url:
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          cleanName
        )}&background=B22222&color=fff&bold=true`,
    });

    onClose();
  };

  const inputBaseClass =
    "w-full rounded-2xl border-[1.5px] border-primary/75 bg-primary-light/20 px-4 sm:px-6 py-3.5 sm:py-4 text-base sm:text-2xl font-normal text-dark placeholder:text-primary/85 focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all";

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl px-5 sm:px-12 py-7 sm:py-10 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Centered Title */}
        <h2 className="text-lg sm:text-2xl md:text-[28px] font-bold uppercase tracking-wide text-primary text-center mb-6 sm:mb-9">
          INPUT CORRECT STAFF DETAILS
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

          {/* 2. Staff ID */}
          <div>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Staff ID"
              aria-label="Staff ID"
              className={inputBaseClass}
            />
          </div>

          {/* 3. Role */}
          <div>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              aria-label="Role"
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
                    alt="Uploaded preview"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
            </button>
          </div>

          {/* Bottom Action Row: Cancel (Left) & Add Staff (Right) */}
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
              className="min-w-[150px] sm:min-w-[200px] px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-base sm:text-2xl font-medium shadow-sm transition-all active:scale-98 text-center"
            >
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
