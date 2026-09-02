import { ArrowRight, Cloud, LockKeyhole, ShieldCheck, UserRoundPlus } from "lucide-react";

import { AccountStatus } from "@/app/account/account-status";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/app/components/site-header";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getChatGPTUser();

  return <main className="site-shell account-page">
    <SiteHeader active="account" />
    <section className="account-shell">
      <div className="account-intro">
        <span><ShieldCheck /> LeseLaut account</span>
        <h1>{user ? `Welcome, ${user.displayName}.` : "Keep your German progress with you."}</h1>
        <p>{user ? "Your learning history is attached to this account and available whenever you sign in." : "Create your LeseLaut profile securely with ChatGPT sign-in. No separate password is stored by LeseLaut."}</p>
      </div>

      {user ? <div className="account-panel">
        <div className="account-profile"><span>{user.displayName.slice(0, 1).toLocaleUpperCase()}</span><div><small>Signed in as</small><strong>{user.displayName}</strong><p>{user.email}</p></div></div>
        <AccountStatus />
        <div className="account-benefits"><div><Cloud /><span><b>Cross-device progress</b><small>Course, stories, grammar, and vocabulary sync automatically.</small></span></div><div><LockKeyhole /><span><b>Private by account</b><small>Every saved record is isolated by your authenticated user ID.</small></span></div></div>
        <a className="account-signout" href={chatGPTSignOutPath("/")} target="_top">Sign out</a>
      </div> : <div className="account-panel account-signup">
        <UserRoundPlus />
        <h2>Create your free account</h2>
        <p>Your current device progress will merge into the new account the first time you sign in.</p>
        <a className="account-signin" href={chatGPTSignInPath("/account")} target="_top">Continue with ChatGPT <ArrowRight /></a>
        <small>Authentication is handled by ChatGPT. LeseLaut never receives or stores your password.</small>
      </div>}
    </section>
  </main>;
}
