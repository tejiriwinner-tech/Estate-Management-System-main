import { Suspense } from "react";
import { ProductCatalogRoute } from "../components/store-screens";

export default function StoreAppProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading product catalog…</div>}>
      <ProductCatalogRoute />
    </Suspense>
  );
}
