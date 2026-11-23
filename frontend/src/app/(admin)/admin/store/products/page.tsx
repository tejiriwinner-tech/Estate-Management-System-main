import { Suspense } from "react";
import { ProductCatalogRoute } from "@/app/(store)/store-app/components/store-screens";

export default function AdminStoreProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading product catalog…</div>}>
      <ProductCatalogRoute />
    </Suspense>
  );
}
