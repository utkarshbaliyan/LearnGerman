"use client";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { LoaderCircle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

import { supabase, RECOVERY_CALLBACK } from "@/app/lib/supabase-client";
import { confirmAuthSession } from '@/app/lib/auth-confirm';
import { recoveryCallback } from '@/app/lib/password-recovery';

function callbackParameters() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    error: search.get("error_description") ?? hash.get("error_description"),
    tokenHash: search.get("token_hash"),
    type: search.get("type") as EmailOtpType | null,
  };
}

export default function AuthConfirmPage() {
  const started = useRef(false);
  const [failure, setFailure] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const recovery = RECOVERY_CALLBACK || recoveryCallback(window.location.search, window.location.hash);
        setIsRecovery(recovery);
        await confirmAuthSession(supabase.auth, callbackParameters());
        if (recovery) window.location.replace('/auth/reset-password');
        // CloudProgressSync in the root layout handles synchronization. Network
        // progress requests must not hold the user on the authentication screen.
        else window.location.replace("/account?auth=confirmed");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Email verification failed. Please request a new link.";
        setFailure(message);
      }
    })();
  }, []);
  return <main className="auth-callback">
    {failure ? <><p role="alert">{failure}</p>
      {isRecovery && <Link href="/auth/reset-password">Continue to password reset</Link>}
      <Link href="/account">Back to sign in</Link>
    </> : <><LoaderCircle className="is-spinning" /><p role="status">Completing your sign-in…</p></>}
  </main>;
}
