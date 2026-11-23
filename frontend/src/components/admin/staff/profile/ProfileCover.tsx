"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/admin/utils";

interface ProfileCoverProps {
  name: string;
  jobTitle: string;
  department: string;
  avatarUrl: string;
  isSuspended: boolean;
}

export function ProfileCover({
  name,
  jobTitle,
  department,
  avatarUrl,
  isSuspended,
}: ProfileCoverProps) {
  return (
    <section>
      {/* Banner */}
      <div className="relative h-32 sm:h-40 lg:h-44 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary-dark shadow-card">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_30%,white_0,transparent_45%),radial-gradient(circle_at_85%_80%,white_0,transparent_40%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-accent" />
      </div>

      {/* Avatar + identity */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-6 px-4 sm:px-6 -mt-14 sm:-mt-16">
        <div
          className={cn(
            "relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl overflow-hidden ring-4 ring-white bg-surface-subtle shadow-elevated shrink-0",
            isSuspended && "grayscale"
          )}
        >
          <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="144px" priority />
        </div>

        <div className="text-center sm:text-left pb-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight">{name}</h1>
            {isSuspended ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-light text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Suspended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-light text-accent-hover">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Active
              </span>
            )}
          </div>
          <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted font-medium mt-1">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <span className="truncate">
              {jobTitle} • {department} Department
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
