import { redirect } from "next/navigation";

export default function LegacyStoreSubscriptionRedirect() {
  redirect("/admin/store/subscription");
}
