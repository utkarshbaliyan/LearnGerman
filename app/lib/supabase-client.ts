"use client";

import { createClient } from "@supabase/supabase-js";
import { authFlowForLocation } from './auth-flow';
import { recoveryCallback } from './password-recovery';

export const SUPABASE_URL = "https://npnzojbbwwdtujuurkmx.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JL4DMPznXLQBcEZCLXjDYg_sMo-9xDo";

// Capture legacy recovery fragments before SDK initialization clears the URL.
export const RECOVERY_CALLBACK = typeof window !== 'undefined' && window.location.pathname === '/auth/confirm' && recoveryCallback(window.location.search, window.location.hash);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
    flowType: typeof window === 'undefined' ? 'pkce' : authFlowForLocation(window.location.pathname, window.location.hash) },
});
