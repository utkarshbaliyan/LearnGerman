"use client";

import { useEffect } from "react";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";
import { clearPendingProgress, setCloudAuthenticated } from "@/app/lib/cloud-progress-save";
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_STORAGE_KEYS, PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { VOCABULARY_LEGACY_STORAGE_KEYS } from "@/app/lib/progress-sync";
import { supabase } from "@/app/lib/supabase-client";

export function CloudProgressSync() {
  useEffect(() => {
    let activeUserId: string | null = null;
    let syncQueued = false;

    const synchronize = () => {
      if (syncQueued) return;
      syncQueued = true;
      queueMicrotask(() => {
        syncQueued = false;
        void synchronizeCloudProgress().catch(() => {});
      });
    };

    void supabase.auth.getSession().then(({ data }) => {
      activeUserId = data.session?.user.id ?? null;
      if (activeUserId) synchronize();
      else setCloudAuthenticated(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user.id ?? null;
      if (!userId) {
        activeUserId = null;
        setCloudAuthenticated(false);
        if (event === "SIGNED_OUT") {
          clearPendingProgress();
          for (const key of Object.values(PROGRESS_STORAGE_KEYS)) localStorage.removeItem(key);
          for (const key of VOCABULARY_LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
          localStorage.removeItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
          window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT));
        }
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || userId !== activeUserId) {
        activeUserId = userId;
        synchronize();
      } else if (event === "TOKEN_REFRESHED") {
        setCloudAuthenticated(true);
      }
    });

    const synchronizeWhenOnline = () => {
      if (activeUserId) synchronize();
    };
    window.addEventListener("online", synchronizeWhenOnline);
    window.addEventListener("focus", synchronizeWhenOnline);
    const onVisible = () => { if (document.visibilityState === "visible") synchronizeWhenOnline(); };
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(onVisible, 30000);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("online", synchronizeWhenOnline);
      window.removeEventListener("focus", synchronizeWhenOnline);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, []);
  return null;
}
