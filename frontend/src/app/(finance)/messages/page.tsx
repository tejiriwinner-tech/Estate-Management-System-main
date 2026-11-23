import { redirect } from "next/navigation";

export default function FinanceMessagesFallback() {
  redirect("/admin/messages");
}
