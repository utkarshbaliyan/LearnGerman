"use client";

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { supabase } = await import("@/app/lib/supabase-client");
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (data.session?.access_token) headers.set("authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers, credentials: "same-origin" });
}
