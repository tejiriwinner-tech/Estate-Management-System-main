"use client";

import React, { useState } from "react";
import { QrCode, Plus, KeyRound, ShieldCheck, Clock, ArrowUpRight } from "lucide-react";
import { Activity, fmtTime, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";
import { readSession } from "@/components/auth/session";
import { QrCodeDisplay } from "@/components/qr/QrCodeDisplay";
import { ResidentGatePassModal } from "@/components/qr/ResidentGatePassModal";

export default function ResidentGatePassesPage() {
  const { data, loading, reload } = useResident<Activity[]>("/activity");
  const session = readSession();
  const [residentName, setResidentName] = useState(session?.name || "Resident");
  const [unitNumber, setUnitNumber] = useState("Estate Unit");

  React.useEffect(() => {
    const email = session?.email || "";
    fetch("/api/v1/resident/profile", {
      headers: email ? { "x-user-email": email } : {},
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((j) => {
        const rName = j?.data?.name || session?.name || "Resident";
        if (j?.data?.name) setResidentName(j.data.name);
        if (j?.data?.unit_number) setUnitNumber(j.data.unit_number);
        return fetch(`/api/v1/security/access/passes?invited_by=${encodeURIComponent(rName)}`, { cache: "no-store" });
      })
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) {
          setPasses(
            j.data
              .filter((p: any) => p.status === "active")
              .map((p: any) => ({
                id: String(p.id),
                visitor: p.guest_name || "Visitor",
                purpose: p.purpose || "Social Visit",
                code: p.code,
                pin: p.pin || "—",
                validTill: p.valid_until ? new Date(p.valid_until).toLocaleString("en-NG") : "24 Hours",
              }))
          );
        }
      })
      .catch(() => {});
  }, [session?.email, session?.name]);

  // Modals
  const [myGatePassOpen, setMyGatePassOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<{
    visitor: string;
    purpose: string;
    code: string;
    pin: string;
  } | null>(null);

  // Visitor form
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("Social Visit");
  const [passes, setPasses] = useState<
    Array<{ id: string; visitor: string; purpose: string; code: string; pin: string; validTill: string }>
  >([]);

  // Household check-out form
  const [memberOutName, setMemberOutName] = useState("");
  const [outWith, setOutWith] = useState("Alone");
  const [msg, setMsg] = useState<string | null>(null);

  const handleCreateVisitorPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    const code = "PAHE-" + Math.floor(1000 + Math.random() * 9000);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newPass = {
      id: String(Date.now()),
      visitor: visitorName.trim(),
      purpose,
      code,
      pin,
      validTill: "24 Hours",
    };
    setPasses((prev) => [newPass, ...prev]);
    setSelectedPass(newPass);
    setVisitorName("");

    try {
      const res = await fetch("/api/v1/security/access/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPass.visitor,
          invited_by: `${residentName} (${unitNumber})`,
          purpose: newPass.purpose,
          code: newPass.code,
          pin: newPass.pin,
          expires_in_minutes: 1440,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasses((prev) => prev.filter((p) => p.code !== code));
        setSelectedPass(null);
        setMsg(json?.message || "Could not save visitor pass to database. Please try again.");
        return;
      }
      if (json?.data?.id) {
        setPasses((prev) => prev.map((p) => (p.code === code ? { ...p, id: String(json.data.id) } : p)));
      }
    } catch {
      setPasses((prev) => prev.filter((p) => p.code !== code));
      setSelectedPass(null);
      setMsg("Network error saving visitor pass. Please try again.");
    }
  };

  const checkOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await send("/activity/check-out", "POST", { name: memberOutName, out_with: outWith });
      setMemberOutName("");
      setMsg(null);
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not record.");
    }
  };

  const checkIn = async (id: number) => {
    const with_ = window.prompt("Returned with? (e.g. Alone, Family)", "Alone");
    if (with_ === null) return;
    try {
      await send(`/activity/${id}/check-in`, "POST", { in_with: with_ });
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not record.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner: Resident Personal Exit QR + Visitor Pass Hub */}
      <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
            <ShieldCheck className="w-4 h-4" />
            <span>Gate Clearance &amp; Digital Credentials</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            Visitor Passes &amp; My Exit QR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate scannable visitor QR passes for security or open your personal Resident Exit QR to leave the estate smoothly.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMyGatePassOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all shrink-0"
        >
          <QrCode className="w-4 h-4 text-[#C9A227]" />
          <span>Open My Exit / Entry QR Pass</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Grid: Issue Visitor QR Pass + Active QR Passes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issue New Visitor QR Pass */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3.5">
            <KeyRound className="w-5 h-5 text-[#B22222]" />
            <h2 className="text-base font-extrabold text-gray-900">Generate Visitor QR Pass</h2>
          </div>

          <form onSubmit={handleCreateVisitorPass} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Visitor Full Name</label>
              <input
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Felix Adewale"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Visit Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              >
                <option>Social Visit</option>
                <option>Delivery / Dispatch</option>
                <option>Maintenance / Artisan</option>
                <option>Official Meeting</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B22222] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Scannable QR Pass</span>
            </button>
          </form>

          {selectedPass && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <QrCodeDisplay
                value={`LINCOLN-PASS:${selectedPass.code}:PIN-${selectedPass.pin}:Villa-A-402:${selectedPass.visitor.replace(/\s+/g, "-")}:${selectedPass.purpose.replace(/\s+/g, "-")}`}
                size={185}
                title={`Visitor: ${selectedPass.visitor}`}
                code={selectedPass.code}
                pin={selectedPass.pin}
                downloadName={`Lincoln-Visitor-${selectedPass.code}`}
                metadata={[
                  { label: "Visitor", value: selectedPass.visitor },
                  { label: "Unit", value: "Villa A-402" },
                  { label: "Purpose", value: selectedPass.purpose },
                ]}
              />
            </div>
          )}
        </div>

        {/* Right: Active Visitor Passes & Household Movement Log */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3.5">
              Active Visitor Passes ({passes.length})
            </h2>

            <div className="mt-3 divide-y divide-gray-100">
              {passes.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{p.visitor}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{p.purpose}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.validTill}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#B22222] bg-[#FEF2F2] px-2.5 py-1 rounded-lg border border-[#B22222]/20">
                      {p.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPass(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Household Check-Out / Check-In Log */}
          <div className="rounded-2xl bg-white border border-gray-200/80 p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-gray-900">Household Gate Movement Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">Log family departures or use your Exit QR Pass for automatic scanning</p>

            <form onSubmit={checkOut} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                required
                value={memberOutName}
                onChange={(e) => setMemberOutName(e.target.value)}
                placeholder="Family member name"
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium"
              />
              <input
                value={outWith}
                onChange={(e) => setOutWith(e.target.value)}
                placeholder="Accompanied by (e.g. Driver)"
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#B22222] hover:bg-[#991B1B] text-white text-xs font-bold py-2 px-4 transition-colors"
              >
                Log Departure
              </button>
            </form>

            {msg && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Out</th>
                    <th className="py-2.5 px-3">With</th>
                    <th className="py-2.5 px-3">In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={4} className="py-6 text-center text-slate-400">Loading movement logs…</td></tr>
                  ) : !data || data.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-slate-400">No departures logged today.</td></tr>
                  ) : (
                    data.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{a.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fmtTime(a.out_at)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{a.out_with ?? "-"}</td>
                        <td className="py-2.5 px-3">
                          {a.in_at ? (
                            <span className="text-emerald-700 font-semibold">{fmtTime(a.in_at)}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => checkIn(a.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                            >
                              Mark Returned
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
