"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Wallet, Plus, MessageSquare, Users } from "lucide-react";

interface PaymentMobileBottomNavProps {
  onAddClick?: () => void;
}

export function PaymentMobileBottomNav({ onAddClick }: PaymentMobileBottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white/95 backdrop-blur-md px-3 py-2">
      {/* 1. Dashboard */}
      <Link
        href="/dashboard"
        className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <LayoutGrid className="h-5 w-5 text-slate-500" />
        <span>Dashboard</span>
      </Link>

      {/* 2. Finance (Active) */}
      <Link
        href="/payments"
        className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-bold text-primary transition-colors"
      >
        <Wallet className="h-5 w-5 text-primary fill-primary/15" />
        <span>Finance</span>
      </Link>

      {/* Center Elevated Floating Action Button (+) */}
      <div className="-mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={onAddClick}
          aria-label="Add new payment"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/35 ring-4 ring-white hover:bg-primary-hover transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 3. Messages */}
      <Link
        href="/messages"
        className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <MessageSquare className="h-5 w-5 text-slate-500" />
        <span>Messages</span>
      </Link>

      {/* 4. Staffs */}
      <Link
        href="/staffs"
        className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Users className="h-5 w-5 text-slate-500" />
        <span>Staffs</span>
      </Link>
    </nav>
  );
}
