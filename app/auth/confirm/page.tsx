"use client";
import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";
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
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const recovery = RECOVERY_CALLBACK || recoveryCallback(window.location.search, window.location.hash);
        await confirmAuthSession(supabase.auth, callbackParameters());
        if (recovery) window.location.replace('/auth/reset-password');
        else {
          await synchronizeCloudProgress();
          window.location.replace("/account?auth=confirmed");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Email verification failed. Please request a new link.";
        window.location.replace(`/account?auth_error=${encodeURIComponent(message)}`);
      }
    })();
  }, []);
  return <main className="auth-callback"><LoaderCircle className="is-spinning" /><p>Completing your sign-in…</p></main>;
}
