// Recovery is scoped to an authenticated account and task; it never replaces cloud work automatically.
export function recoveryKey(owner: string, taskId: string) { return `leselaut-draft:${owner}:${taskId}`; }
export function readRecovery(storage: Pick<Storage, "getItem">, owner: string, taskId: string, remote: string): string | null {
  try {
    const cached = JSON.parse(storage.getItem(recoveryKey(owner, taskId)) ?? "null");
    return typeof cached?.text === "string" && cached.text.length <= 8000 && cached.text !== remote ? cached.text : null;
  } catch { return null; }
}
export function acknowledgeDraft(storage: Pick<Storage, "setItem" | "removeItem">, owner: string, taskId: string, submitted: string, current: string, version: number) {
  if (submitted === current) storage.removeItem(recoveryKey(owner, taskId));
  else storage.setItem(recoveryKey(owner, taskId), JSON.stringify({ text: current, version }));
}
