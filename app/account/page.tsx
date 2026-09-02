import { AccountClient } from "@/app/account/account-client";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <main className="site-shell account-page">
    <SiteHeader active="account" />
    <AccountClient />
  </main>;
}
