"use client";

import { FormEvent, useEffect, useState } from "react";
import { Cloud, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AccountStatus } from "@/app/account/account-status";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import { supabase } from "@/app/lib/supabase-client";

type Account = { email: string; displayName: string; username: string };

export function AccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) { setAccount(null); return; }
    void authenticatedFetch("/api/account", { cache: "no-store" }).then(async (response) => response.ok ? setAccount((await response.json()).account) : null);
  }, [user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const username = String(data.get("username") ?? "").trim();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/confirm` } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account, then sign in.");
    else setMessage("Signed in successfully.");
  }
  async function signOut() { setBusy(true); await supabase.auth.signOut(); setBusy(false); setMessage("Signed out."); }

  const displayName = account?.displayName ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Learner";
  return <section className="account-shell">
    <div className="account-intro"><span><ShieldCheck /> LeseLaut account</span><h1>{user ? `Welcome, ${displayName}.` : "Keep your German progress with you."}</h1><p>{user ? "Your learning history is attached to this account and available whenever you sign in." : "Create a secure LeseLaut account with a username, email, and password. Your progress will follow you across devices."}</p></div>
    {user ? <div className="account-panel">
      <div className="account-profile"><span>{displayName.slice(0, 1).toLocaleUpperCase()}</span><div><small>Signed in as</small><strong>{displayName}</strong><p>{account ? `@${account.username} · ` : ""}{user.email}</p></div></div>
      <AccountStatus />
      <div className="account-benefits"><div><Cloud /><span><b>Cross-device progress</b><small>Course, stories, grammar, and vocabulary sync automatically.</small></span></div><div><LockKeyhole /><span><b>Private by account</b><small>Every saved record is isolated by your authenticated user ID.</small></span></div></div>
      <button className="account-signout" type="button" onClick={signOut} disabled={busy}><LogOut /> Sign out</button>
    </div> : <div className="account-panel account-auth">
      <div className="account-auth-tabs" role="tablist" aria-label="Account action"><button type="button" className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button><button type="button" className={mode === "signin" ? "is-active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button></div>
      <form onSubmit={submit}>
        {mode === "signup" && <label>Username<input name="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" autoComplete="username" placeholder="german_learner" /></label>}
        <label>Email<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label>
        <label>Password<input name="password" required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>
        <button className="account-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      {message && <p className="account-auth-message" aria-live="polite">{message}</p>}
      <small>Passwords are securely handled by Supabase and are never stored by LeseLaut.</small>
    </div>}
  </section>;
}
