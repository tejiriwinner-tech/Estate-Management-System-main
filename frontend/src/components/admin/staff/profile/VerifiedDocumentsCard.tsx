"use client";

import React, { useRef, useState } from "react";
import { FolderOpen, FileText, IdCard, BadgeCheck, File, Upload } from "lucide-react";
import { StaffDocument, DocumentKind } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

const kindStyles: Record<DocumentKind, { icon: React.ElementType; color: string }> = {
  pdf: { icon: FileText, color: "text-primary" },
  id: { icon: IdCard, color: "text-accent" },
  verified: { icon: BadgeCheck, color: "text-accent" },
  file: { icon: File, color: "text-dark" },
};

interface VerifiedDocumentsCardProps {
  documents: StaffDocument[];
}

export function VerifiedDocumentsCard({ documents }: VerifiedDocumentsCardProps) {
  const [docs, setDocs] = useState<StaffDocument[]>(documents);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    setDocs((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: file.name,
        kind: isPdf ? "pdf" : "file",
        meta: "Uploaded just now",
      },
    ]);
    e.target.value = "";
  };

  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-dark tracking-tight">
          <FolderOpen className="w-5 h-5 text-accent" />
          Verified Documents
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors no-print"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload New
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
        {docs.map((doc) => {
          const { icon: Icon, color } = kindStyles[doc.kind];
          return (
            <div
              key={doc.id}
              className="group rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-card-hover transition-all cursor-pointer"
            >
              <Icon className={cn("w-6 h-6", color)} />
              <div className="mt-3 text-sm font-bold text-dark break-all leading-snug group-hover:text-primary transition-colors">
                {doc.name}
              </div>
              <div className="text-[11px] text-muted font-medium mt-1">{doc.meta}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
