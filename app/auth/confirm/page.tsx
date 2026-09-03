"use client";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";
import { supabase } from "@/app/lib/supabase-client";

function callbackParameters() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return {
    code: search.get("code"),
    error: search.get("error_description") ?? hash.get("error_description"),
    tokenHash: search.get("token_hash"),
    type: search.get("type") as EmailOtpType | null,
  };
}

export default function AuthConfirmPage() {
  useEffect(() => {
    void (async () => {
      try {
        const parameters = callbackParameters();
        if (parameters.error) throw new Error(parameters.error);
        if (parameters.tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: parameters.tokenHash,
            type: parameters.type ?? "email",
          });
          if (error) throw error;
        } else if (parameters.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(parameters.code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("The confirmation link is invalid or has expired.");
        await synchronizeCloudProgress();
        window.location.replace("/account?auth=confirmed");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Email verification failed. Please request a new link.";
        window.location.replace(`/account?auth_error=${encodeURIComponent(message)}`);
      }
    })();
  }, []);
  return <main className="auth-callback"><LoaderCircle className="is-spinning" /><p>Confirming your account…</p></main>;
}
