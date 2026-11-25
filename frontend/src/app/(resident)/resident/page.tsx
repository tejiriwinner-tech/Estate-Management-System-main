"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  KeyRound,
  Plus,
  ShieldCheck,
  Users,
  Wrench,
  X,
  QrCode,
  Copy,
  Calendar,
} from "lucide-react";
import { DashboardData, naira } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";
import { readSession } from "@/components/auth/session";
import { QrCodeDisplay } from "@/components/qr/QrCodeDisplay";
import { ResidentGatePassModal } from "@/components/qr/ResidentGatePassModal";
import { ResidentServiceChargePanel } from "@/components/resident/ResidentServiceChargePanel";

interface PassModalData {
  visitorName: string;
  visitorPhone: string;
  expectedDate: string;
  purpose: string;
}

export default function ResidentDashboard() {
  const { data, loading } = useResident<DashboardData>("/dashboard");
  const session = readSession();
  const residentName = session?.name || "Chinedu Resident";

  // Resident personal exit/entry QR modal
  const [myGatePassOpen, setMyGatePassOpen] = useState(false);

  // Quick visitor pass generator modal
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState<PassModalData>({
    visitorName: "",
    visitorPhone: "",
    expectedDate: new Date().toISOString().split("T")[0],
    purpose: "Social Visit",
  });
  const [generatedPass, setGeneratedPass] = useState<{ code: string; pin: string } | null>(null);

  const [activePasses, setActivePasses] = useState([
    {
      id: "P-101",
      visitor: "Engr. Tunde Bakare",
      type: "Facility Maintenance",
      code: "LP-8841",
      pin: "491028",
      validTill: "Today, 6:00 PM",
      status: "Active",
    },
    {
      id: "P-102",
      visitor: "Chiamaka Okafor",
      type: "Personal Guest",
      code: "LP-6290",
      pin: "739201",
      validTill: "Today, 10:00 PM",
      status: "Checked In",
    },
  ]);

  // Away notification modal
  const [awayModalOpen, setAwayModalOpen] = useState(false);
  const [awayDates, setAwayDates] = useState({ departure: "", returnDate: "", notes: "" });
  const [awaySuccess, setAwaySuccess] = useState(false);

  // Local checklist state for reminders
  const [localReminders, setLocalReminders] = useState([
    { id: 1, text: "Annual General Meeting (AGM) at Estate Clubhouse", due_time: "10:00 AM", is_completed: false },
    { id: 2, text: "Submit quarterly electricity meter reading to Facility Desk", due_time: "3:00 PM", is_completed: true },
    { id: 3, text: "Perimeter gate biometric sensor routine update", due_time: "Tomorrow", is_completed: false },
  ]);

  const toggleReminder = (id: number) => {
    setLocalReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_completed: !r.is_completed } : r))
    );
  };

  const handleGeneratePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.visitorName.trim()) return;
    const randomCode = "LP-" + Math.floor(1000 + Math.random() * 9000);
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPass({ code: randomCode, pin: randomPin });

    // Add to active passes list immediately
    setActivePasses((prev) => [
      {
        id: `P-${Date.now()}`,
        visitor: passForm.visitorName.trim(),
        type: passForm.purpose,
        code: randomCode,
        pin: randomPin,
        validTill: "24 Hours",
        status: "Active",
      },
      ...prev,
    ]);

    // Sync visitor pass to security gate database
    try {
      await fetch("/api/v1/security/access/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: passForm.visitorName.trim(),
          invited_by: `${residentName} (Villa A-402)`,
          code: randomCode,
          expires_in_minutes: 1440,
        }),
      });
    } catch {
      // Non-blocking fallback
    }
  };

  // Resolve dynamic stats with fallbacks
  const totalPaid = data?.total_paid ? naira(data.total_paid) : "₦485,000";
  const neighborsCount = data?.neighbors || 142;
  const familyActivitiesCount = data?.family_activities || 12;
  const estateUpdate = data?.estate_update || {
    headline_prefix: "Estate Infrastructure: ",
    headline_highlight: "Solar Power Upgrades Phase 2",
    image_url:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    lead_paragraph:
      "Phase 1 solar inverter installation has been successfully concluded across all central sectors.",
    body_paragraph:
      "All street illumination arrays and CCTV nodes are now linked to 24/7 dedicated clean power grid. Main Gate biometric ANPR is fully online.",
    published_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-white via-white to-red-50/40 p-6 border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B22222]">
            <span className="w-2 h-2 rounded-full bg-[#B22222]" />
            <span>Post Army House Estate Resident Residence</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {residentName}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Villa A-402, Phase 1 • Access Credentials: <strong className="text-gray-800">Verified & Active</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setMyGatePassOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
          >
            <QrCode className="w-4 h-4 text-[#C9A227]" />
            <span>My Gate Pass (Exit QR)</span>
          </button>

          <button
            onClick={() => {
              setGeneratedPass(null);
              setPassForm({
                visitorName: "",
                visitorPhone: "",
                expectedDate: new Date().toISOString().split("T")[0],
                purpose: "Social Visit",
              });
              setPassModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#B22222] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#991B1B] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Visitor Pass</span>
          </button>

          <button
            onClick={() => setAwayModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Log Away Notice</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Resident Status Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Unit Security Clearance & Exit QR */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Clearance</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">Villa A-402</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Biometric & Exit QR Active</p>
          </div>
          <button
            type="button"
            onClick={() => setMyGatePassOpen(true)}
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Open My Exit / Entry QR</span>
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Active Passes */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
              {activePasses.length} Valid
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor Passes</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{activePasses.length} Active</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">3 gate clearances this week</p>
          </div>
          <button
            onClick={() => setPassModalOpen(true)}
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Issue New Pass</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Registered Vehicles */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Car className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
              ANPR Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Vehicles</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">2 Vehicles</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">KJA-492AA • ABC-819XY</p>
          </div>
          <Link
            href="/resident/profile/properties"
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Manage Vehicles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 4: Household Members */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/60">
              Verified
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Household</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">4 Members</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{neighborsCount} Neighbors in Community</p>
          </div>
          <Link
            href="/resident/profile/family"
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Family Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Resident Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setMyGatePassOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-[#C9A227] shadow-2xs group-hover:bg-[#B22222] group-hover:text-white transition-colors">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">My Exit QR Pass</span>
            <span className="text-[10px] text-slate-400 font-medium">Instant gate exit/entry</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGeneratedPass(null);
              setPassModalOpen(true);
            }}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-2xs group-hover:text-[#B22222] group-hover:bg-[#FEF2F2]">
              <KeyRound className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Visitor QR Pass</span>
            <span className="text-[10px] text-slate-400 font-medium">Generate visitor scan</span>
          </button>

          <button
            type="button"
            onClick={() => setAwayModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-2xs group-hover:text-[#B22222] group-hover:bg-[#FEF2F2]">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Away Notice</span>
            <span className="text-[10px] text-slate-400 font-medium">Notify Security</span>
          </button>

          <Link
            href="/resident/messages"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-2xs group-hover:text-[#B22222] group-hover:bg-[#FEF2F2]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Messages & Notices</span>
            <span className="text-[10px] text-slate-400 font-medium">Official bulletins</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Operations View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Active Visitor Passes & Household Activity (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Visitor Passes Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Active Visitor Passes</h2>
                <p className="text-xs text-slate-500">Click any visitor pass to view or share its scannable QR code</p>
              </div>
              <button
                onClick={() => {
                  setGeneratedPass(null);
                  setPassModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[#FEF2F2] px-3 py-1.5 text-xs font-bold text-[#B22222] hover:bg-red-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Pass</span>
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {activePasses.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                      {p.visitor.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{p.visitor}</p>
                      <p className="text-[11px] text-slate-500">{p.type} • Valid: {p.validTill}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPassForm({
                          visitorName: p.visitor,
                          visitorPhone: "",
                          expectedDate: new Date().toISOString().split("T")[0],
                          purpose: p.type,
                        });
                        setGeneratedPass({ code: p.code, pin: p.pin });
                        setPassModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#B22222]/40 hover:bg-[#FEF2F2] text-xs font-bold text-slate-700 hover:text-[#B22222] transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR</span>
                    </button>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-[#B22222] bg-[#FEF2F2] px-2 py-1 rounded-md border border-[#B22222]/20">
                        {p.code}
                      </span>
                      <p className="text-[10px] font-semibold text-emerald-600 mt-1">{p.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Unit Service Charges Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Unit Service Charge Assessment
              </span>
              <Link
                href="/resident/service-charges"
                className="text-xs font-bold text-[#B22222] hover:underline"
              >
                View Full Ledger →
              </Link>
            </div>
            <ResidentServiceChargePanel scope="resident" compact />
          </div>

          {/* Household Gate Activity Summary */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Gate Clearance</h2>
                <p className="text-xs text-slate-500">Automated ANPR and visitor logs for Villa A-402</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">Gate 1 & Gate 2</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-900">Vehicle KJA-492AA (Toyota Prado)</span>
                </div>
                <span className="font-medium text-slate-500">Entry Cleared • 14:22</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-gray-900">Guest Pass LP-6290 (Chiamaka Okafor)</span>
                </div>
                <span className="font-medium text-slate-500">Entry Cleared • 12:05</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="font-semibold text-gray-900">Vehicle ABC-819XY (Honda Civic)</span>
                </div>
                <span className="font-medium text-slate-500">Exit Recorded • 08:30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Estate Bulletin & Personal Checklist (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Official Estate Bulletin Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B22222]" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Estate Announcement
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {estateUpdate.published_at
                  ? new Date(estateUpdate.published_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Today"}
              </span>
            </div>

            {estateUpdate.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={estateUpdate.image_url}
                alt="Estate Notice"
                className="h-44 w-full rounded-xl object-cover bg-slate-100 mb-4"
              />
            )}

            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
              {estateUpdate.headline_prefix}
              <span className="text-[#B22222]">{estateUpdate.headline_highlight}</span>
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-700 leading-relaxed">
              {estateUpdate.lead_paragraph}
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {estateUpdate.body_paragraph}
            </p>
          </div>

          {/* Personal Reminder Checklist */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Resident Reminders
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {localReminders.filter((r) => !r.is_completed).length} pending
              </span>
            </div>

            <ul className="space-y-3">
              {localReminders.map((r) => (
                <li
                  key={r.id}
                  onClick={() => toggleReminder(r.id)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <button
                    type="button"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      r.is_completed
                        ? "bg-[#B22222] border-[#B22222] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {r.is_completed && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug ${
                        r.is_completed ? "text-slate-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {r.text}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.due_time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Pass Generator Modal */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">Generate Visitor Pass</h3>
              <button
                onClick={() => setPassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!generatedPass ? (
              <form onSubmit={handleGeneratePass} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Visitor Full Name</label>
                  <input
                    required
                    value={passForm.visitorName}
                    onChange={(e) => setPassForm({ ...passForm, visitorName: e.target.value })}
                    placeholder="e.g. Babatunde Lawal"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input
                    value={passForm.visitorPhone}
                    onChange={(e) => setPassForm({ ...passForm, visitorPhone: e.target.value })}
                    placeholder="e.g. +234 803 000 0000"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expected Date</label>
                    <input
                      type="date"
                      value={passForm.expectedDate}
                      onChange={(e) => setPassForm({ ...passForm, expectedDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Purpose of Visit</label>
                    <select
                      value={passForm.purpose}
                      onChange={(e) => setPassForm({ ...passForm, purpose: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none bg-white"
                    >
                      <option>Social Visit</option>
                      <option>Delivery / Dispatch</option>
                      <option>Maintenance / Artisan</option>
                      <option>Official Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPassModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B] shadow-xs"
                  >
                    Generate Pass
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4">
                <QrCodeDisplay
                  value={`LINCOLN-PASS:${generatedPass.code}:PIN-${generatedPass.pin}:Villa-A-402:${passForm.visitorName.replace(/\s+/g, "-")}:${passForm.purpose.replace(/\s+/g, "-")}`}
                  size={196}
                  title={`Visitor Pass: ${passForm.visitorName}`}
                  code={generatedPass.code}
                  pin={generatedPass.pin}
                  subtitle="Share this QR pass with your visitor. Security will scan it at Gate 1 / Gate 2."
                  downloadName={`Lincoln-Visitor-Pass-${generatedPass.code}`}
                  metadata={[
                    { label: "Visitor", value: passForm.visitorName },
                    { label: "Destination", value: "Villa A-402 (Phase 1)" },
                    { label: "Purpose", value: passForm.purpose },
                    { label: "Validity", value: "24 Hours from issue" },
                  ]}
                />

                <button
                  type="button"
                  onClick={() => setPassModalOpen(false)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Away Notification Modal */}
      {awayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900">Log Away Notification</h3>
              <button
                onClick={() => {
                  setAwayModalOpen(false);
                  setAwaySuccess(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!awaySuccess ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAwaySuccess(true);
                }}
                className="mt-4 space-y-4"
              >
                <p className="text-xs text-slate-500">
                  Notify Post Army House Estate Security Command that Villa A-402 will be unoccupied so perimeter patrols provide extra surveillance.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Departure Date</label>
                    <input
                      type="date"
                      required
                      value={awayDates.departure}
                      onChange={(e) => setAwayDates({ ...awayDates, departure: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expected Return</label>
                    <input
                      type="date"
                      required
                      value={awayDates.returnDate}
                      onChange={(e) => setAwayDates({ ...awayDates, returnDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Emergency Instructions / Caretaker Notes</label>
                  <textarea
                    rows={3}
                    value={awayDates.notes}
                    onChange={(e) => setAwayDates({ ...awayDates, notes: e.target.value })}
                    placeholder="e.g. Generator is switched off. Caretaker visits on Thursdays."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:ring-2 focus:ring-[#B22222] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAwayModalOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B] shadow-xs"
                  >
                    Submit Notice
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h4 className="text-base font-extrabold text-gray-900">Notice Registered with Security</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Security Command will monitor Villa A-402 during your absence. No unscheduled visitors will be permitted without telephone verification.
                </p>
                <button
                  onClick={() => {
                    setAwayModalOpen(false);
                    setAwaySuccess(false);
                  }}
                  className="w-full rounded-xl bg-[#B22222] py-2.5 text-xs font-bold text-white hover:bg-[#991B1B]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resident Personal Gate Pass (Exit & Entry QR) Modal */}
      <ResidentGatePassModal
        isOpen={myGatePassOpen}
        onClose={() => setMyGatePassOpen(false)}
        residentName={residentName}
        unitNumber="Villa A-402"
        vehiclePlate="KJA-492AA"
      />
    </div>
  );
}
