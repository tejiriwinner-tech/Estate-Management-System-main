import IdentityClearancePanel from "@/components/security/access/IdentityClearancePanel";

export default function IdentityClearancePage() {
  return (
    <div className="max-w-sm mx-auto py-4">
      <IdentityClearancePanel
        gate="Gate 04"
        residentName="Jonathan Villa"
        residentId="Res. #902"
        lastEntryTime="14:22"
        lastEntryGate="Gate 04 (Main)"
        isActive={true}
        clearanceLabel="Sec. Clearance"
      />
    </div>
  );
}
