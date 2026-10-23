'use client';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-client';
import { AUTH_CONFIRM_URL } from './public-site';

export async function googleProviderEnabled(signal?: AbortSignal) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, signal });
  if (!response.ok) return false;
  const settings = await response.json() as { external?: { google?: boolean } };
  return settings.external?.google === true;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: AUTH_CONFIRM_URL } });
}
