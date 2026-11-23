"use client";

import { useState } from "react";
import { MapPin, Upload, Send, Phone, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Contact {
  name: string;
  number: string;
}

interface Props {
  contacts: Contact[];
  onSubmit?: (data: { description: string; type: string }) => void;
}

export default function EmergencyReportPanel({ contacts, onSubmit }: Props) {
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("Intelligent Security Report");
  const [contactsOpen, setContactsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col overflow-hidden">
      {/* Live location banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[--color-primary-light] border-b border-[--color-border]">
        <span className="w-2 h-2 rounded-full bg-[--color-success] animate-pulse shrink-0" />
        <span className="text-xs font-semibold text-[--color-primary]">LIVE LOCATION SHARING · ACTIVE</span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Instructions */}
        <p className="text-xs text-[--color-text-muted] leading-relaxed">
          Emergency response is available 24/7. Select the level of urgency required.
        </p>

        {/* Panic button */}
        <button className="w-full py-6 rounded-xl bg-[--color-danger] text-white flex flex-col items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-all select-none">
          <AlertTriangle className="w-6 h-6 mb-1" />
          <span className="text-base font-black uppercase tracking-widest">Life Under Threat</span>
          <span className="text-xs font-medium opacity-80">TAP AND HOLD FOR 3 SECONDS</span>
        </button>

        {/* Standard alert */}
        <button className="w-full py-3 rounded-xl border-2 border-dashed border-[--color-primary] text-[--color-primary] text-sm font-semibold hover:bg-[--color-primary-light] transition-colors flex items-center justify-center gap-2">
          <span className="text-lg">✳</span> Standard Emergency Alert
        </button>

        <div className="border-t border-[--color-border] pt-1">
          <p className="text-[10px] text-[--color-text-subtle] uppercase font-semibold tracking-wide mb-3">Or Report Activity</p>

          {/* Report type */}
          <label className="text-xs font-semibold text-[--color-text] mb-1.5 block">
            {reportType}
          </label>
          <p className="text-xs text-[--color-text-muted] mb-3">
            Report suspicious behaviour or security breaches. Photos are automatically time-stamped and geotagged.
          </p>

          {/* Photo upload */}
          <button className="w-full py-3 rounded-lg border-2 border-dashed border-[--color-border] flex flex-col items-center gap-1 text-[--color-text-muted] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors mb-3">
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Add Photo / Video</span>
          </button>

          {/* Description */}
          <textarea
            rows={3}
            placeholder="Describe what you are seeing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm text-[--color-text] placeholder:text-[--color-text-subtle] border border-[--color-border] rounded-lg px-3 py-2.5 resize-none outline-none focus:border-[--color-primary] transition-colors mb-3"
          />

          {/* Submit */}
          <button
            onClick={() => onSubmit?.({ description, type: reportType })}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[--color-primary] text-white text-sm font-semibold hover:bg-[--color-primary-dark] transition-colors"
          >
            <Send className="w-4 h-4" /> Submit Report
          </button>
        </div>

        {/* Immediate contacts */}
        <div className="border-t border-[--color-border] pt-4">
          <button
            onClick={() => setContactsOpen((p) => !p)}
            className="flex items-center justify-between w-full mb-3"
          >
            <p className="text-xs font-bold text-[--color-text] uppercase tracking-wide">Immediate Contacts</p>
            {contactsOpen ? <ChevronUp className="w-4 h-4 text-[--color-text-muted]" /> : <ChevronDown className="w-4 h-4 text-[--color-text-muted]" />}
          </button>
          {contactsOpen && (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.name} className="flex items-center justify-between p-3 rounded-lg border border-[--color-border] hover:border-[--color-primary] transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[--color-primary]" />
                    <div>
                      <p className="text-xs font-semibold text-[--color-text]">{c.name}</p>
                      <p className="text-[10px] text-[--color-text-muted]">{c.number}</p>
                    </div>
                  </div>
                  <a href={`tel:${c.number}`} className="p-2 rounded-lg bg-[--color-primary-light] text-[--color-primary] hover:bg-[--color-primary] hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
