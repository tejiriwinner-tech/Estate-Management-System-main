import { redirect } from "next/navigation";

export default function SecurityActivityRedirect() {
  redirect("/security/reports/activity");
}
