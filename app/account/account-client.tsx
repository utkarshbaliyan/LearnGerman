"use client";

import { FormEvent, useEffect, useState } from "react";
import { Cloud, Download, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AccountStatus } from "@/app/account/account-status";
import { authenticatedFetch } from "@/app/lib/authenticated-fetch";
import { AUTH_CONFIRM_URL } from "@/app/lib/public-site";
import { supabase } from "@/app/lib/supabase-client";
import { googleProviderEnabled, signInWithGoogle } from '@/app/lib/google-auth';
import { AccountDeletion } from './account-deletion';
import { requestRecovery } from '@/app/lib/password-recovery';
import { browserSession } from '@/app/lib/browser-session';

type Account = { email: string; displayName: string; username: string };

export function AccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "recover">("signup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState(false);

  useEffect(() => {
    if (!sessionReady || user) return;
    const controller = new AbortController();
    void googleProviderEnabled(controller.signal).then(setGoogleAvailable).catch(() => {});
    return () => controller.abort();
  }, [sessionReady, user]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const authError = parameters.get("auth_error");
    const deletion = parameters.get('deletion');
    const callbackMessage = authError ?? (deletion === 'complete' ? 'Your account has been deleted.' : deletion === 'pending' ? 'Your learning data is removed and access is blocked. Authentication account deletion is queued for retry. Contact leselaut.team@gmail.com if you need help.' : parameters.get("auth") === "confirmed" ? "Signed in. Your account and progress are ready." : "");
    const frame = requestAnimationFrame(() => {
      if (callbackMessage) setMessage(callbackMessage);
    });
    if (parameters.has("auth") || parameters.has("auth_error") || deletion) window.history.replaceState({}, "", "/account");
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    void browserSession().then(session => setUser(session?.user ?? null)).catch(() => setMessage('Sign-in is temporarily unavailable. Please retry.')).finally(() => setSessionReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionReady(true);
      if (!session) setAccount(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void authenticatedFetch("/api/account", { cache: "no-store" }).then(async (response) => {
      if (response.ok && !cancelled) {
        const payload = await response.json() as { account: Account };
        setAccount(payload.account);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const passwordConfirmation = String(data.get("passwordConfirmation") ?? "");
    const username = String(data.get("username") ?? "").trim();
    if (mode === "signup" && password !== passwordConfirmation) {
      setBusy(false); setMessage("The passwords do not match."); return;
    }
    try {
      if (mode === 'recover') {
        await requestRecovery(supabase.auth, email, AUTH_CONFIRM_URL);
        setMessage('If an account exists for this email, a recovery link will be sent. Open it in this browser.');
        return;
      }
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: AUTH_CONFIRM_URL } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else if (mode === "signup" && !result.data.session) setMessage("Check your email to confirm your account, then sign in.");
      else setMessage("Signed in successfully.");
    } catch {
      setMessage("Sign-in is temporarily unavailable. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try { await supabase.auth.signOut(); setMessage("Signed out."); }
    catch { setMessage("Sign-out failed. Please try again."); }
    finally { setBusy(false); }
  }

  async function googleSignIn() {
    setBusy(true); setMessage('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch {
      setBusy(false);
      setMessage('Google sign-in is temporarily unavailable. Please try again or use your email.');
    }
  }

  async function exportData() {
    setExporting(true); setExportMessage("");
    try {
      const response = await authenticatedFetch("/api/account/export", { cache: "no-store" });
      if (!response.ok) throw new Error("Export unavailable");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = "leselaut-account-data.json";
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportMessage("Download started. Keep this file private: it contains your learning history.");
    } catch {
      setExportMessage("Download failed. Check your connection and sign-in, then try again.");
    } finally { setExporting(false); }
  }

  const displayName = account?.displayName ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Learner";
  return <section className="account-shell">
    <div className="account-intro"><span><ShieldCheck /> LeseLaut account</span><h1>{user ? `Welcome, ${displayName}.` : mode === "recover" ? "Recover your account." : "Keep your German progress with you."}</h1><p>{user ? "Your learning history is attached to this account and available whenever you sign in." : mode === "recover" ? "Enter your account email to request a password recovery link. Open it in this browser." : "Create a secure LeseLaut account with a username, email, and password. Your progress will follow you across devices."}</p></div>
    {!sessionReady ? <div className="account-panel account-session-loading" aria-live="polite">Checking your account…</div> : user ? <div className="account-panel">
      <div className="account-profile"><span>{displayName.slice(0, 1).toLocaleUpperCase()}</span><div><small>Signed in as</small><strong>{displayName}</strong><p>{account ? `@${account.username} · ` : ""}{user.email}</p></div></div>
      <AccountStatus />
      <div className="account-benefits"><div><Cloud /><span><b>Cross-device progress</b><small>Stories, grammar, vocabulary, and Active Learning sync automatically.</small></span></div><div><LockKeyhole /><span><b>Private by account</b><small>Every saved record is isolated by your authenticated user ID.</small></span></div></div>
      <div className="account-data-export">
        <h2>Your saved data</h2>
        <p>Download your server-saved profile, progress, tutor drafts, attempts, feedback, and AI usage as JSON. Unsynced browser drafts and original photos or recordings are not included.</p>
        <button className="account-signout" type="button" onClick={exportData} disabled={busy || exporting}><Download /> {exporting ? "Preparing download…" : "Download my data"}</button>
        {exportMessage && <p role="status">{exportMessage}</p>}
      </div>
      <AccountDeletion userId={user.id} email={user.email ?? ''} />
      <button className="account-signout" type="button" onClick={signOut} disabled={busy || exporting}><LogOut /> Sign out</button>
    </div> : <div className="account-panel account-auth">
      {googleAvailable && <div className="account-social-auth"><button type="button" className="account-google" onClick={googleSignIn} disabled={busy}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.88-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z"/></svg>{busy ? 'Connecting…' : 'Continue with Google'}</button><p>or use your email</p></div>}
      <div className="account-auth-tabs" role="tablist" aria-label="Account action"><button type="button" className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button><button type="button" className={mode === "signin" ? "is-active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button></div>
      <form onSubmit={submit}>
        {mode === "signup" && <label>Username<input name="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" autoComplete="username" placeholder="german_learner" /></label>}
        <label>Email<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label>
        {mode !== 'recover' && <label>Password<input name="password" required type="password" minLength={8} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>}
        {mode === "signup" && <label>Confirm password<input name="passwordConfirmation" required type="password" minLength={8} autoComplete="new-password" placeholder="Enter the password again" /></label>}
        <button className="account-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === 'recover' ? 'Send recovery link' : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>
      <button className="account-signout" type="button" disabled={busy} onClick={() => { setMode(mode === 'recover' ? 'signin' : 'recover'); setMessage(''); }}>{mode === 'recover' ? 'Back to sign in' : 'Forgot password?'}</button>
      {message && <p className="account-auth-message" aria-live="polite">{message}</p>}
      <small>Passwords are securely handled by Supabase and are never stored by LeseLaut.</small>
    </div>}
  </section>;
}
