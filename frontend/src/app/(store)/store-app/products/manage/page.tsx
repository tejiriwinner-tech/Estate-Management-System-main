import { redirect } from "next/navigation";

export default function LegacyStoreManageRedirect() {
  redirect("/admin/store/inventory");
}
