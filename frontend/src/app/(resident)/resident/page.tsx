"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  KeyRound,
  MessageSquare,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  X,
  Copy,
} from "lucide-react";
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

interface StoreProductPreview {
  id: number;
  store_name?: string;
  shop_unit?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

interface ResidentOrderPreview {
  id: number;
  order_no: string;
  product_name: string;
  quantity: number;
  total_naira: number;
  status: string;
}

export default function ResidentDashboard() {
  const session = readSession();
  const [residentName, setResidentName] = useState(session?.name || "Resident");
  const [unitNumber, setUnitNumber] = useState("Assigned Unit");
  const [products, setProducts] = useState<StoreProductPreview[]>([]);
  const [orders, setOrders] = useState<ResidentOrderPreview[]>([]);
  const [activePasses, setActivePasses] = useState<
    Array<{ id: string; visitor: string; type: string; code: string; pin: string; validTill: string; status: string }>
  >([]);

  const [myGatePassOpen, setMyGatePassOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState<PassModalData>({
    visitorName: "",
    visitorPhone: "",
    expectedDate: new Date().toISOString().split("T")[0],
    purpose: "Social Visit",
  });
  const [generatedPass, setGeneratedPass] = useState<{ code: string; pin: string } | null>(null);

  const [awayModalOpen, setAwayModalOpen] = useState(false);
  const [awayDates, setAwayDates] = useState({ departure: "", returnDate: "", notes: "" });
  const [awaySuccess, setAwaySuccess] = useState(false);

  const loadDashboard = useCallback(async () => {
    const email = session?.email || "";
    try {
      const [profRes, prodRes, ordRes] = await Promise.all([
        fetch("/api/v1/resident/profile", {
          headers: email ? { "x-user-email": email } : {},
          cache: "no-store",
        }).then((r) => r.json()),
        fetch("/api/v1/store/products?activeOnly=true", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/v1/store/orders${email ? `?email=${encodeURIComponent(email)}` : ""}`, {
          cache: "no-store",
        }).then((r) => r.json()),
      ]);
      if (profRes?.data?.name) setResidentName(profRes.data.name);
      if (profRes?.data?.unit_number) setUnitNumber(profRes.data.unit_number);
      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
      setOrders(Array.isArray(ordRes?.data) ? ordRes.data : []);
    } catch {
      // non-blocking
    }
  }, [session?.email]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleGeneratePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.visitorName.trim()) return;
    const randomCode = "PAHE-" + Math.floor(1000 + Math.random() * 9000);
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPass({ code: randomCode, pin: randomPin });

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

    try {
      await fetch("/api/v1/security/access/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: passForm.visitorName.trim(),
          invited_by: `${residentName} (${unitNumber})`,
          code: randomCode,
          expires_in_minutes: 1440,
        }),
      });
    } catch {
      // non-blocking
    }
  };

  const pendingOrders = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-white via-white to-red-50/40 p-6 border border-gray-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B22222]">
            <span className="w-2 h-2 rounded-full bg-[#B22222]" />
            <span>Post Army House Estate • Resident Portal</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {residentName}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            {unitNumber} • Access Credentials: <strong className="text-gray-800">Verified &amp; Active</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMyGatePassOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#C9A227]" />
            <span>My Gate Pass (Exit QR)</span>
          </button>

          <button
            type="button"
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
            className="flex items-center gap-2 rounded-xl bg-[#B22222] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#991B1B] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Visitor Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setAwayModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Log Away Notice</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Live Executive Status Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
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
            <p className="text-xl font-extrabold text-gray-900 mt-0.5 truncate">{unitNumber}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Biometric &amp; Exit QR Active</p>
          </div>
          <button
            type="button"
            onClick={() => setMyGatePassOpen(true)}
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B] cursor-pointer"
          >
            <span>Open My Exit / Entry QR</span>
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
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
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Gate pass generator</p>
          </div>
          <button
            type="button"
            onClick={() => setPassModalOpen(true)}
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B] cursor-pointer"
          >
            <span>Issue New Pass</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#B22222]">
              <Store className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-[#B22222] border border-rose-200/60">
              {products.length} Items
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estate Stores</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{orders.length} Orders</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{pendingOrders} in delivery progress</p>
          </div>
          <Link
            href="/resident/store"
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Browse &amp; Order Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              Billing
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Charges</p>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">Estate Levies</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Upload receipts &amp; view status</p>
          </div>
          <Link
            href="/resident/service-charges"
            className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-[#B22222] hover:text-[#991B1B]"
          >
            <span>Manage Service Charges</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. Estate Marketplace Showcase & My Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">Featured Estate Store Products</h2>
              <p className="text-xs text-slate-400">Uploaded by verified Post Army House Estate merchants</p>
            </div>
            <Link href="/resident/store" className="text-xs font-bold text-[#B22222] hover:underline">
              Open Storefront →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No store products listed yet</p>
              <p className="text-[11px] text-slate-400">Active shop items will appear here for instant ordering.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href="/resident/store"
                  className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3 hover:border-[#B22222]/40 hover:bg-slate-50/60 transition-all"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {p.store_name && (
                      <p className="text-[10px] font-extrabold uppercase text-[#B22222] truncate">{p.store_name}</p>
                    )}
                    <p className="text-xs font-extrabold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs font-black text-slate-700 mt-0.5">₦{p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">My Store Orders</h2>
              <p className="text-xs text-slate-400">Live delivery &amp; fulfillment tracking</p>
            </div>
            <Link href="/resident/store" className="text-xs font-bold text-[#B22222] hover:underline">
              View All →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Truck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No store orders yet</p>
              <Link href="/resident/store" className="inline-block text-xs font-bold text-[#B22222] hover:underline">
                Browse Estate Stores
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {o.product_name} × {o.quantity}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">{o.order_no}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-slate-900">₦{o.total_naira.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-[#B22222]">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resident Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setMyGatePassOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-[#C9A227]">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">My Exit QR Pass</span>
            <span className="text-[10px] text-slate-400">Instant gate exit/entry</span>
          </button>

          <Link
            href="/resident/store"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#B22222] shadow-2xs">
              <Store className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Estate Stores</span>
            <span className="text-[10px] text-slate-400">Shop &amp; order delivery</span>
          </Link>

          <button
            type="button"
            onClick={() => setAwayModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-2xs">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Away Notice</span>
            <span className="text-[10px] text-slate-400">Notify Security</span>
          </button>

          <Link
            href="/resident/messages"
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-slate-50/60 p-4 text-center hover:bg-[#FEF2F2] hover:border-[#B22222]/30 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-2xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-gray-900">Messages &amp; Notices</span>
            <span className="text-[10px] text-slate-400">Chat &amp; estate bulletins</span>
          </Link>
        </div>
      </div>

      {/* 5. Service Charges Panel */}
      <ResidentServiceChargePanel scope="resident" />

      {/* Visitor Pass Modal */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Generate Visitor Gate Pass</h3>
              <button type="button" onClick={() => setPassModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedPass ? (
              <div className="text-center space-y-4 py-2">
                <QrCodeDisplay value={`PAHE-VISITOR:${generatedPass.code}:${unitNumber}`} size={160} />
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Pass Code &amp; PIN</p>
                  <p className="text-lg font-extrabold text-[#B22222] font-mono">
                    {generatedPass.code} • PIN {generatedPass.pin}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(`${generatedPass.code} (PIN: ${generatedPass.pin})`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#B22222] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Pass Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleGeneratePass} className="space-y-3">
                <input
                  required
                  value={passForm.visitorName}
                  onChange={(e) => setPassForm({ ...passForm, visitorName: e.target.value })}
                  placeholder="Visitor Full Name"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium"
                />
                <input
                  value={passForm.visitorPhone}
                  onChange={(e) => setPassForm({ ...passForm, visitorPhone: e.target.value })}
                  placeholder="Visitor Phone Number"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium"
                />
                <select
                  value={passForm.purpose}
                  onChange={(e) => setPassForm({ ...passForm, purpose: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold"
                >
                  <option>Social Visit</option>
                  <option>Delivery</option>
                  <option>Maintenance / Technician</option>
                </select>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#B22222] hover:bg-[#991b1b] py-2.5 text-xs font-extrabold text-white cursor-pointer"
                >
                  Generate QR Pass
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Away Notice Modal */}
      {awayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Log Away Notice</h3>
              <button type="button" onClick={() => setAwayModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {awaySuccess ? (
              <div className="text-center py-4 space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Security Command notified for {unitNumber}.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch("/api/v1/admin/away", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      resident_name: residentName,
                      unit_number: unitNumber,
                      departure_date: awayDates.departure,
                      return_date: awayDates.returnDate,
                      notes: awayDates.notes,
                    }),
                  }).catch(() => {});
                  setAwaySuccess(true);
                  setTimeout(() => {
                    setAwaySuccess(false);
                    setAwayModalOpen(false);
                  }, 2000);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Departure</label>
                    <input
                      required
                      type="date"
                      value={awayDates.departure}
                      onChange={(e) => setAwayDates({ ...awayDates, departure: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Return</label>
                    <input
                      required
                      type="date"
                      value={awayDates.returnDate}
                      onChange={(e) => setAwayDates({ ...awayDates, returnDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={awayDates.notes}
                  onChange={(e) => setAwayDates({ ...awayDates, notes: e.target.value })}
                  placeholder="Instructions for Security Patrol..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#B22222] hover:bg-[#991b1b] py-2.5 text-xs font-extrabold text-white cursor-pointer"
                >
                  Submit Away Notice
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <ResidentGatePassModal
        isOpen={myGatePassOpen}
        onClose={() => setMyGatePassOpen(false)}
        residentName={residentName}
        unitNumber={unitNumber}
      />
    </div>
  );
}
