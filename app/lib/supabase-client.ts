"use client";

import { createClient } from "@supabase/supabase-js";
import { authFlowForLocation } from './auth-flow';

export const SUPABASE_URL = "https://npnzojbbwwdtujuurkmx.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JL4DMPznXLQBcEZCLXjDYg_sMo-9xDo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
    flowType: typeof window === 'undefined' ? 'pkce' : authFlowForLocation(window.location.pathname, window.location.hash) },
});
