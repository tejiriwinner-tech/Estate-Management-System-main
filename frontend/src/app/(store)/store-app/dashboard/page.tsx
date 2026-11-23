import { redirect } from "next/navigation";

export default function LegacyStoreDashboardRedirect() {
  redirect("/admin/store/analytics");
}
