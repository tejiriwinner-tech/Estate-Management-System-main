"use client";

// Figma "User About" (About tab) with Edit button.
import React, { useEffect, useState } from "react";
import { GreenButton, StateMsg } from "@/components/resident/ui";
import { Profile, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

export default function AboutTab() {
  const { data, error, loading, reload } = useResident<Profile>("/profile");
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (data) setAbout(data.about ?? ""); }, [data]);

  const save = async () => {
    try { await send("/profile", "PUT", { about }); setEditing(false); setMsg(null); await reload(); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Could not save."); }
  };

  return (
    <div className="min-h-64">
      <StateMsg loading={loading} error={error} />
      {data && (editing
        ? <textarea aria-label="About" value={about} onChange={(e) => setAbout(e.target.value)} rows={8} className="w-full rounded-md border border-muted/50 p-3 text-base" />
        : <p className="whitespace-pre-line text-lg">{data.about || "Nothing here yet. Press Edit to tell your neighbours about yourself."}</p>)}
      {msg && <p role="alert" className="mt-2 text-sm text-alert">{msg}</p>}
      <div className="mt-8 flex justify-end gap-3">
        {editing && <button onClick={() => setEditing(false)} className="rounded-md border border-muted/60 px-5 py-2.5">Cancel</button>}
        <GreenButton onClick={editing ? save : () => setEditing(true)} className="w-36">{editing ? "Save" : "Edit"}</GreenButton>
      </div>
    </div>
  );
}
