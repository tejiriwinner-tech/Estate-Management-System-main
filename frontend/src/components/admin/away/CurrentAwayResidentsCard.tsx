"use client";

import React, { useState } from "react";
import { ExternalLink, Pencil, Calendar, Home } from "lucide-react";
import { AwayResidentRecord } from "@/types/admin/away";
import { cn } from "@/lib/admin/utils";

interface CurrentAwayResidentsCardProps {
  residents: AwayResidentRecord[];
  onEditResident: (record: AwayResidentRecord) => void;
}

export function CurrentAwayResidentsCard({
  residents,
  onEditResident,
}: CurrentAwayResidentsCardProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedResidents = showAll ? residents : residents.slice(0, 3);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/70 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-5 sm:px-6 py-5 flex items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Current Away Residents
        </h2>

        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:text-primary-hover transition-colors"
        >
          <span>{showAll ? "Show Less" : "View All"}</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>

      {/* ================= DESKTOP TABLE (md and up) ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] border-y border-border/60 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              <th className="py-3.5 pl-6 pr-3">RESIDENT</th>
              <th className="py-3.5 px-3">DEPARTURE</th>
              <th className="py-3.5 px-3">
                <div>EXPECTED</div>
                <div>RETURN</div>
              </th>
              <th className="py-3.5 px-3">STATUS</th>
              <th className="py-3.5 pl-3 pr-6 text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50 text-xs sm:text-sm">
            {displayedResidents.map((item) => {
              const nameParts = item.resident_name.split(" ");
              const isCheckRequired = item.status === "check_required";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-surface-subtle/60 transition-colors"
                >
                  {/* Resident */}
                  <td className="py-4 pl-6 pr-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-light/75 text-primary font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>

                      <div className="leading-snug">
                        <div className="font-bold text-dark">
                          <div>{nameParts[0]}</div>
                          {nameParts.slice(1).join(" ") && (
                            <div>{nameParts.slice(1).join(" ")}</div>
                          )}
                        </div>
                        <div className="text-[11px] text-muted font-medium mt-0.5">
                          {item.unit}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Departure */}
                  <td className="py-4 px-3 align-middle text-muted font-medium whitespace-nowrap">
                    {item.departure_date}
                  </td>

                  {/* Expected Return */}
                  <td className="py-4 px-3 align-middle font-semibold leading-snug">
                    {item.is_overdue ? (
                      <div className="text-primary">
                        <div>{item.expected_return_date}</div>
                        <div className="text-xs font-bold">(Overdue)</div>
                      </div>
                    ) : (
                      <span className="text-dark">
                        {item.expected_return_date}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3 align-middle">
                    {isCheckRequired ? (
                      <span className="inline-flex flex-col items-center justify-center px-3 py-1 rounded-2xl text-[11px] font-bold bg-primary-light text-primary leading-tight">
                        <span>Check</span>
                        <span>Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-accent-light text-accent">
                        Away
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6 align-middle text-right">
                    <button
                      type="button"
                      onClick={() => onEditResident(item)}
                      title={`Edit ${item.resident_name}`}
                      aria-label={`Edit ${item.resident_name}`}
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle transition-colors inline-flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE & SMALL TABLET CARDS (< md) ================= */}
      <div className="md:hidden divide-y divide-border/60 border-t border-border/60">
        {displayedResidents.map((item) => {
          const isCheckRequired = item.status === "check_required";
          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-light/75 text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-dark text-sm truncate">
                      {item.resident_name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted font-medium">
                      <Home className="w-3 h-3 text-accent shrink-0" />
                      <span>{item.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCheckRequired ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-light text-primary">
                      Check Required
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-light text-accent">
                      Away
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onEditResident(item)}
                    aria-label={`Edit ${item.resident_name}`}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-surface-subtle/60 rounded-xl p-3 border border-border/50 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted">
                    Departure
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-dark mt-0.5">
                    <Calendar className="w-3 h-3 text-accent shrink-0" />
                    <span>{item.departure_date}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-muted">
                    Expected Return
                  </div>
                  <div
                    className={cn(
                      "font-semibold mt-0.5",
                      item.is_overdue ? "text-primary" : "text-dark"
                    )}
                  >
                    {item.expected_return_date}
                    {item.is_overdue && " (Overdue)"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
