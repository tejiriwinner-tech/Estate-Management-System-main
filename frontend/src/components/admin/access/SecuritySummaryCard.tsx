"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Car, Bike, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { SecuritySummaryData, SecurityIncident } from "@/types/admin/access";

interface SecuritySummaryCardProps {
  summary: SecuritySummaryData;
}

export function SecuritySummaryCard({ summary }: SecuritySummaryCardProps) {
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(
    summary.incidents
  );

  const unresolvedCount = incidents.filter((i) => !i.resolved).length;

  const handleToggleResolve = (id: number) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, resolved: !inc.resolved } : inc
      )
    );
  };

  return (
    <>
      <div className="bg-surface-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
        {/* Subtle decorative background curve at top-right matching Figma */}
        <div className="w-32 h-32 rounded-full bg-accent-light/40 absolute -top-10 -right-10 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Card Heading */}
          <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
            Today&apos;s Security Summary
          </h2>

          {/* Sub-Card 1: Vehicles Entered */}
          <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between gap-3 border border-border/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-primary shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted font-medium leading-tight">
                  <div>Vehicles</div>
                  <div>Entered</div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-dark mt-0.5">
                  {summary.vehicles_entered}
                </div>
              </div>
            </div>

            {summary.vehicles_trend && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-accent-light text-accent">
              {summary.vehicles_trend}
            </span>
            )}
          </div>

          {/* Sub-Card 2: Pedestrians */}
          <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between gap-3 border border-border/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-accent shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-muted font-medium">Pedestrians</div>
                <div className="text-xl sm:text-2xl font-extrabold text-dark mt-0.5">
                  {summary.pedestrians}
                </div>
              </div>
            </div>

            {summary.pedestrians_trend && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#EAECEF] text-dark/80">
              {summary.pedestrians_trend}
            </span>
            )}
          </div>

          {/* Sub-Card 3: ALERTS Box */}
          <div className="bg-primary-light/65 border border-primary/25 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 stroke-[2.3]" />
              <span>{summary.alert_title}</span>
            </div>

            <p className="text-xs sm:text-sm text-dark/90 font-medium leading-relaxed">
              {unresolvedCount > 0
                ? `${unresolvedCount} Unregistered vehicle${
                    unresolvedCount > 1 ? "s" : ""
                  } attempted entry at Service Gate.`
                : "All gate security incidents have been reviewed and resolved."}
            </p>

            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(true)}
              className="text-xs font-extrabold text-primary hover:text-primary-hover hover:underline pt-1 inline-block"
            >
              Review Incidents
            </button>
          </div>
        </div>

        {/* Bottom Section: Active Duty Personnel */}
        <div className="pt-5 border-t border-border/60 relative z-10">
          <div className="text-xs font-extrabold text-dark mb-3">
            Active Duty Personnel
          </div>

          <div className="flex items-center -space-x-2.5">
            {summary.active_personnel.map((officer) => (
              <div
                key={officer.id}
                title={`${officer.name} — ${officer.role}`}
                className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-2xs"
              >
                <Image
                  src={officer.avatar_url}
                  alt={officer.name}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
            ))}
            <div className="w-9 h-9 rounded-full bg-[#F2F4F7] ring-2 ring-white text-xs font-extrabold text-dark flex items-center justify-center shadow-2xs">
              +{summary.extra_personnel_count}
            </div>
          </div>
        </div>
      </div>

      {/* Review Incidents Modal */}
      {isIncidentModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsIncidentModalOpen(false)}
        >
          <div
            className="bg-surface-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 text-primary font-extrabold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Gate Security Incidents</span>
              </div>
              <button
                type="button"
                onClick={() => setIsIncidentModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl border border-border/80 bg-surface-subtle/50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-dark text-sm">
                        {inc.plate}
                      </span>
                      <span className="text-xs text-muted font-semibold">
                        • {inc.gate} ({inc.time})
                      </span>
                    </div>
                    <p className="text-xs text-muted font-medium">
                      {inc.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleResolve(inc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 inline-flex items-center gap-1 ${
                      inc.resolved
                        ? "bg-accent-light text-accent"
                        : "bg-primary text-white hover:bg-primary-hover"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{inc.resolved ? "Resolved" : "Mark Resolved"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
