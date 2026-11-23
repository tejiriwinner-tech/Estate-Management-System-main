import { Suspense } from "react";
import { InventoryScreen } from "../../components/store-screens";

export default function StoreAppInventoryManagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading inventory management…</div>}>
      <InventoryScreen />
    </Suspense>
  );
}
