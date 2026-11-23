import { redirect } from "next/navigation";

export default function LegacyStoreProductsRedirect() {
  redirect("/admin/store/products");
}
