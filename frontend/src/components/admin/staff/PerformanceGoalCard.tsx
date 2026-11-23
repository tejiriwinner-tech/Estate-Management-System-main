"use client";

import React from "react";
import { Star } from "lucide-react";

interface PerformanceGoalCardProps {
  title: string;
  subtitle: string;
  achievedPct: number;
}

export function PerformanceGoalCard({
  title,
  subtitle,
  achievedPct,
}: PerformanceGoalCardProps) {
  const clamped = Math.max(0, Math.min(100, achievedPct));

  return (
    <div className="bg-gradient-to-br from-[#6E1414] via-primary to-[#8B1A1A] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[210px] relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="w-36 h-36 rounded-full bg-accent/10 blur-2xl absolute -top-10 -right-10 pointer-events-none" />

      {/* Top Star Icon & Heading */}
      <div className="space-y-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center shadow-2xs">
          <Star className="w-5 h-5 text-accent fill-accent" />
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-white/80 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Target Achieved Progress Bar */}
      <div className="space-y-2 pt-6 relative z-10">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-white/90">Target Achieved</span>
          <span className="text-accent">{clamped}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            style={{ width: `${clamped}%` }}
            className="h-full rounded-full bg-accent transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}
