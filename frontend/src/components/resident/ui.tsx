import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-lg bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${className}`}>{children}</section>
);

export const GreenButton = ({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} className={`rounded-md bg-brand px-5 py-2.5 text-base text-white transition hover:bg-brand-dark disabled:opacity-60 ${className}`} />
);

export const StateMsg = ({ loading, error }: { loading?: boolean; error?: string | null }) =>
  loading ? <p className="py-6 text-center text-sm text-muted">Loading…</p> : error ? <p role="alert" className="py-6 text-center text-sm text-alert">{error}</p> : null;

export function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-base">
        <thead><tr className="bg-row text-muted">{head.map((h) => <th key={h} className="px-5 py-3 font-normal">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={head.length} className="px-5 py-6 text-center text-muted">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-row"}>{r.map((c, j) => <td key={j} className="px-5 py-3 text-muted">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
