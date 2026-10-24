"use client";

// The auth SDK can wait on initialization or another tab's refresh lock. Bound
// that wait as well as fetch so a stalled session cannot strand progress sync.
export async function browserSession(signal: AbortSignal = AbortSignal.timeout(15_000)) {
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    const result = await Promise.race([
      import('./supabase-client').then(({ supabase }) => {
        signal.throwIfAborted();
        return supabase.auth.getSession();
      }),
      aborted,
    ]);
    signal.throwIfAborted();
    if (result.error) throw result.error;
    return result.data.session;
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
}
