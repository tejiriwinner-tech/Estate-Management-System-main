import { Suspense } from "react";
import { SubscriptionScreen } from "../components/store-screens";

export default function StoreAppSubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading settlements &amp; subscription…</div>}>
      <SubscriptionScreen />
    </Suspense>
  );
}
