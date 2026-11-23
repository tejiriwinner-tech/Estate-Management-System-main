"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Home, Clock, Shield } from "lucide-react";
import { AccessLogItem, AccessStatus } from "@/types/admin/access";

interface AccessLogCardProps {
  logs: AccessLogItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

function AccessStatusPill({ status }: { status: AccessStatus }) {
  if (status === "in_estate") {
    return (
      <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-light text-accent whitespace-nowrap">
        IN ESTATE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EFF1F5] text-dark/80 whitespace-nowrap">
      CHECKED OUT
    </span>
  );
}

export function AccessLogCard({
  logs,
  searchQuery,
  onSearchChange,
}: AccessLogCardProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedLogs = showAll ? logs : logs.slice(0, 5);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/70 shadow-xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Header: Title + Search Input */}
        <div className="px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
            Access Log
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search logs..."
              aria-label="Search access logs"
              className="w-full bg-[#F4F6F9] hover:bg-[#EDF0F5] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-dark placeholder:text-muted font-medium border border-transparent focus:border-primary/40 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* ================= DESKTOP TABLE (md and up) ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-3.5 pl-6 pr-3">RESIDENT/VISITOR</th>
                <th className="py-3.5 px-3">HOUSE NO.</th>
                <th className="py-3.5 px-3">
                  <div>CHECK-</div>
                  <div>IN</div>
                </th>
                <th className="py-3.5 px-3">
                  <div>CHECK-</div>
                  <div>OUT</div>
                </th>
                <th className="py-3.5 px-3">GATE</th>
                <th className="py-3.5 pl-3 pr-6 text-right">STATUS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50 text-xs sm:text-sm">
              {displayedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted font-medium"
                  >
                    No access logs match your search or filter.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((item) => {
                  const checkInParts = item.check_in.split(" ");
                  const checkOutParts = item.check_out.split(" ");
                  const gateParts = item.gate.split(" ");

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-subtle/60 transition-colors"
                    >
                      {/* Resident / Visitor */}
                      <td className="py-4 pl-6 pr-3 align-middle">
                        <div className="flex items-center gap-3">
                          {item.avatar_url ? (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
                              <Image
                                src={item.avatar_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#EFF1F5] text-dark font-extrabold text-xs flex items-center justify-center shrink-0">
                              {item.initials ||
                                item.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-bold text-dark leading-snug">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-muted font-medium leading-tight mt-0.5">
                              {item.person_type}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* House No. */}
                      <td className="py-4 px-3 align-middle font-semibold text-dark leading-snug">
                        {item.house_no}
                      </td>

                      {/* Check-In */}
                      <td className="py-4 px-3 align-middle text-dark/90 font-medium leading-tight">
                        <div>{checkInParts[0]}</div>
                        {checkInParts[1] && (
                          <div className="text-[11px] text-muted">
                            {checkInParts[1]}
                          </div>
                        )}
                      </td>

                      {/* Check-Out */}
                      <td className="py-4 px-3 align-middle text-dark/90 font-medium leading-tight">
                        {item.check_out === "-" ? (
                          <span className="text-muted">-</span>
                        ) : (
                          <>
                            <div>{checkOutParts[0]}</div>
                            {checkOutParts[1] && (
                              <div className="text-[11px] text-muted">
                                {checkOutParts[1]}
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Gate */}
                      <td className="py-4 px-3 align-middle text-dark/90 font-medium leading-tight">
                        <div>{gateParts[0]}</div>
                        {gateParts[1] && (
                          <div className="text-[11px] text-muted">
                            {gateParts[1]}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 pl-3 pr-6 align-middle text-right">
                        <AccessStatusPill status={item.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE & SMALL TABLET CARDS (< md) ================= */}
        <div className="md:hidden divide-y divide-border/60">
          {displayedLogs.length === 0 ? (
            <div className="py-10 px-4 text-center text-sm text-muted font-medium">
              No access logs match your search or filter.
            </div>
          ) : (
            displayedLogs.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                {/* Top: Avatar + Name/Type + Status Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.avatar_url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                        <Image
                          src={item.avatar_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#EFF1F5] text-dark font-extrabold text-xs flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-extrabold text-dark text-sm truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted font-medium truncate">
                        {item.person_type}
                      </div>
                    </div>
                  </div>
                  <AccessStatusPill status={item.status} />
                </div>

                {/* 2x2 Info Grid */}
                <div className="grid grid-cols-2 gap-2.5 bg-surface-subtle/60 rounded-xl p-3 border border-border/50 text-xs">
                  <div className="flex items-center gap-1.5 text-dark font-semibold">
                    <Home className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{item.house_no}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-dark font-semibold">
                    <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{item.gate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>In: {item.check_in}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Out: {item.check_out}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer: View All Logs */}
      <div className="px-6 py-4 border-t border-border/60 text-center bg-surface-card">
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs sm:text-sm font-extrabold text-primary hover:text-primary-hover transition-colors"
        >
          {showAll ? "Show Recent Logs" : "View All Logs"}
        </button>
      </div>
    </div>
  );
}
