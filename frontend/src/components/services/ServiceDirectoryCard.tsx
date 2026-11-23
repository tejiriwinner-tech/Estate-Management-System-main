"use client";

import React from "react";
import {
  Filter,
  Download,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { EstateServiceItem, ServiceStatus } from "@/types/serviceManagement";

interface ServiceDirectoryCardProps {
  services: EstateServiceItem[];
  statusFilter: "All" | ServiceStatus;
  onCycleFilter: () => void;
  onExportCsv: () => void;
  onEdit: (service: EstateServiceItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (service: EstateServiceItem) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ServiceDirectoryCard({
  services,
  statusFilter,
  onCycleFilter,
  onExportCsv,
  onEdit,
  onDelete,
  onToggleStatus,
  currentPage,
  onPageChange,
}: ServiceDirectoryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* 1. Directory Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold tracking-tight text-dark">
            Service Directory
          </h2>
          {statusFilter !== "All" && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              Filter: {statusFilter}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCycleFilter}
            title={`Filter by status (Current: ${statusFilter})`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-dark hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Filter className="h-4 w-4 text-accent" />
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            title="Export Service Directory CSV"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-dark hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-primary" />
          </button>
        </div>
      </div>

      {/* 2. Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">SERVICE NAME</th>
              <th className="py-3.5 px-4">CATEGORY</th>
              <th className="py-3.5 px-4">SERVICE FEE</th>
              <th className="py-3.5 px-4">FREQUENCY</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-4">DATE CREATED</th>
              <th className="py-3.5 px-6 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {services.map((item) => {
              const isActive = item.status === "Active";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Service Name */}
                  <td className="py-4 px-6 font-bold text-primary max-w-[160px] leading-snug">
                    {item.name}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 font-medium text-slate-600 max-w-[130px] leading-snug">
                    {item.category}
                  </td>

                  {/* Service Fee */}
                  <td className="py-4 px-4 font-extrabold text-dark font-mono">
                    ₦
                    {item.fee.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Frequency */}
                  <td className="py-4 px-4 font-medium text-slate-600">
                    {item.frequency}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-primary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Date Created */}
                  <td className="py-4 px-4 font-medium text-slate-400 max-w-[100px] leading-snug">
                    {item.dateCreated}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title={`Edit ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        title={`Delete ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* View / Toggle Active */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        title={
                          isActive
                            ? `View / Pause ${item.name}`
                            : `Activate ${item.name}`
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? "border border-slate-200 bg-white text-primary hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isActive ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Mobile Card Stack (< md) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {services.map((item) => {
          const isActive = item.status === "Active";

          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-primary">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {item.category} • {item.frequency}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-primary"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Service Fee
                  </p>
                  <p className="text-sm font-extrabold text-dark font-mono">
                    ₦
                    {item.fee.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item)}
                    aria-label={`Toggle ${item.name}`}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? "border border-slate-200 bg-white text-primary"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {isActive ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-100 text-xs">
        <p className="font-medium text-slate-400">
          Showing 1-{services.length} of 12 entries
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Previous
          </button>

          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPage === p
                  ? "bg-primary text-white shadow-xs"
                  : "border border-slate-200 bg-white text-dark hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(3, currentPage + 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-dark hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
