import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

interface UnderConstructionProps {
  moduleName: string;
}

export function UnderConstruction({ moduleName }: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-surface-card rounded-2xl border border-border/80 shadow-card">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-light text-accent mb-4 border border-accent/20">
        <Clock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-dark mb-2">{moduleName} Module</h2>
      <p className="text-muted max-w-md mb-6 text-sm">
        This module is part of the LincolnEstate roadmap and will be implemented in subsequent phases.
      </p>
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}

