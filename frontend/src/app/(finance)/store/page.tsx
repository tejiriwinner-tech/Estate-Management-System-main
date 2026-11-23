import { redirect } from "next/navigation";

export default function FinanceStoreFallback() {
  redirect("/store-app");
}
