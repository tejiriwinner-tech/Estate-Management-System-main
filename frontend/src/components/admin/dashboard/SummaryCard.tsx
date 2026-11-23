"use client";

import React from "react";
import { Users, Home, Wallet, ClipboardList, TrendingUp } from "lucide-react";
import { MetricCardData } from "@/types/admin/dashboard";
import { cn } from "@/lib/admin/utils";

interface SummaryCardProps {
  data: MetricCardData;
}

export function SummaryCard({ data }: SummaryCardProps) {
  const renderIcon = () => {
    switch (data.iconType) {
      case "residents":
        return <Users className="w-5 h-5 text-primary" />;
      case "houses":
        return <Home className="w-5 h-5 text-accent" />;
      case "revenue":
        return <Wallet className="w-5 h-5 text-primary" />;
      case "requests":
        return <ClipboardList className="w-5 h-5 text-dark" />;
      default:
        return <Users className="w-5 h-5 text-primary" />;
    }
  };

  const renderBadge = () => {
    if (data.trend) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-light text-dark border border-accent/20">
          <TrendingUp className="w-3 h-3 text-accent" />
          <span>{data.trend}</span>
        </span>
      );
    }
    if (data.badge) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-subtle text-muted border border-border">
          {data.badge}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col justify-between p-6 bg-surface-card rounded-2xl border border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200">
      {/* Top row: Icon and Badge/Trend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-subtle border border-border/60">
          {renderIcon()}
        </div>
        {renderBadge()}
      </div>

      {/* Bottom section: Label and Value */}
      <div>
        <span className="block text-xs font-bold tracking-wider text-muted uppercase mb-1">
          {data.label}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
          {data.value}
        </div>
      </div>
    </div>
  );
}

