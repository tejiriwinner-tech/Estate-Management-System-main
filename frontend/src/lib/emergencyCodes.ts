export type EmergencyCodeKey = "CODE_RED" | "CODE_AMBER" | "CODE_BLUE" | "CODE_YELLOW";

export interface EmergencyCodeSpec {
  key: EmergencyCodeKey;
  label: string;
  shortLabel: string;
  title: string;
  protocol: string;
  priority: string;
  badgeClass: string;
  cardClass: string;
  dotClass: string;
}

export const EMERGENCY_CODES: Record<EmergencyCodeKey, EmergencyCodeSpec> = {
  CODE_RED: {
    key: "CODE_RED",
    label: "CODE RED",
    shortLabel: "Code Red",
    title: "Armed Intrusion / Perimeter Breach",
    protocol: "Immediate gate lockdown, alert central police dispatch, activate siren.",
    priority: "Priority Level 1",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    cardClass: "border-red-300 bg-red-50/70 hover:bg-red-50",
    dotClass: "bg-red-600",
  },
  CODE_AMBER: {
    key: "CODE_AMBER",
    label: "CODE AMBER",
    shortLabel: "Code Amber",
    title: "Medical Incident / Panic Alarm",
    protocol: "Dispatch roving paramedic unit to unit coordinates, open VIP gate for ambulance.",
    priority: "Priority Level 1",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    cardClass: "border-amber-300 bg-amber-50/70 hover:bg-amber-50",
    dotClass: "bg-amber-500",
  },
  CODE_BLUE: {
    key: "CODE_BLUE",
    label: "CODE BLUE",
    shortLabel: "Code Blue",
    title: "Fire Outbreak / Electrical Hazard",
    protocol: "Engage estate water hydrant team, notify state fire service, evacuate sector.",
    priority: "Priority Level 1",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    cardClass: "border-blue-300 bg-blue-50/70 hover:bg-blue-50",
    dotClass: "bg-blue-600",
  },
  CODE_YELLOW: {
    key: "CODE_YELLOW",
    label: "CODE YELLOW",
    shortLabel: "Code Yellow",
    title: "Suspicious Loitering / Vehicle Tailgate",
    protocol: "Challenge subject, verify digital guest QR pass, log ANPR plate data.",
    priority: "Priority Level 2",
    badgeClass: "bg-yellow-100 text-yellow-900 border-yellow-300",
    cardClass: "border-yellow-300 bg-yellow-50/70 hover:bg-yellow-50",
    dotClass: "bg-yellow-500",
  },
};

export const EMERGENCY_CODE_LIST: EmergencyCodeSpec[] = [
  EMERGENCY_CODES.CODE_RED,
  EMERGENCY_CODES.CODE_AMBER,
  EMERGENCY_CODES.CODE_BLUE,
  EMERGENCY_CODES.CODE_YELLOW,
];

export function parseCodedAlert(message: string): {
  codeKey: EmergencyCodeKey;
  spec: EmergencyCodeSpec;
  sender: string;
  role: string;
  details: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAccuracy: number | null;
} {
  const raw = message || "";
  let codeKey: EmergencyCodeKey = "CODE_AMBER";
  if (/CODE[_\s]?RED/i.test(raw)) codeKey = "CODE_RED";
  else if (/CODE[_\s]?BLUE/i.test(raw)) codeKey = "CODE_BLUE";
  else if (/CODE[_\s]?YELLOW/i.test(raw)) codeKey = "CODE_YELLOW";
  else if (/CODE[_\s]?AMBER/i.test(raw)) codeKey = "CODE_AMBER";

  const senderMatch = raw.match(/Sender:\s*([^|()]+?)(?:\s*\(([^)]+)\))?(?:\s*\||$)/i);
  const gpsMatch = raw.match(/GPS:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*\(±(\d+)m\))?/i);
  const detailsMatch = raw.match(/Details:\s*(.+?)(?:\s*\|\s*GPS:|$)/i);

  return {
    codeKey,
    spec: EMERGENCY_CODES[codeKey],
    sender: senderMatch?.[1]?.trim() || "Estate Member",
    role: senderMatch?.[2]?.trim() || "Resident",
    details: detailsMatch?.[1]?.trim() || raw.replace(/^\[CODE[^\]]+\]\s*/i, "").trim(),
    gpsLat: gpsMatch ? Number(gpsMatch[1]) : null,
    gpsLng: gpsMatch ? Number(gpsMatch[2]) : null,
    gpsAccuracy: gpsMatch?.[3] ? Number(gpsMatch[3]) : null,
  };
}
