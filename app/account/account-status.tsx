"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Cloud, LoaderCircle } from "lucide-react";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";

export function AccountStatus() {
  const [status, setStatus] = useState<"syncing" | "ready" | "error">("syncing");

  useEffect(() => {
    Promise.all([
      fetch("/api/account", { credentials: "same-origin", cache: "no-store" }),
      synchronizeCloudProgress(),
    ]).then(([account, sync]) => setStatus(account.ok && sync.synced ? "ready" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  return <div className={`account-sync-status is-${status}`} aria-live="polite">
    {status === "syncing" ? <LoaderCircle className="is-spinning" /> : status === "ready" ? <CheckCircle2 /> : <Cloud />}
    <span><strong>{status === "syncing" ? "Syncing your learning data" : status === "ready" ? "Progress is synced" : "Cloud sync is temporarily unavailable"}</strong><small>{status === "ready" ? "Your course, stories, grammar, and vocabulary follow this account." : status === "error" ? "Your progress is still saved on this device and will retry automatically." : "Merging this device with your account…"}</small></span>
  </div>;
}
