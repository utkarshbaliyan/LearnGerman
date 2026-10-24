"use client";
import { browserSession } from './browser-session';

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const signal = init.signal ?? AbortSignal.timeout(20_000);
  const session = await browserSession(signal);
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set("authorization", `Bearer ${session.access_token}`);
  signal.throwIfAborted();
  return fetch(input, { ...init, headers, signal, credentials: "same-origin" });
}
