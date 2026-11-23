"use client";

import { useState } from "react";
import PanicButton from "@/components/security/emergency/PanicButton";
import PanicActiveState from "@/components/security/emergency/PanicActiveState";

const CONTACTS = [
  { name: "Estate Security",    number: "+234 801 234 5675", icon: "security" as const },
  { name: "Medical Center",     number: "+234 803 465 1890", icon: "medical"  as const },
  { name: "Fire Service",       number: "+234 802 345 8781", icon: "fire"     as const },
  { name: "Police Control Room",number: "+234 800 112 4587", icon: "police"   as const },
];

export default function PanicPage() {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <PanicActiveState
        dispatchUnit="Unit 04"
        etaMins={2}
        residentLocation="Sector A – North Gate"
        alertTime="14:32 PST"
        onCancel={() => setActivated(false)}
        onCallSecurity={() => window.open("tel:+2348012345675")}
      />
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <PanicButton contacts={CONTACTS} onActivate={() => setActivated(true)} />
    </div>
  );
}
