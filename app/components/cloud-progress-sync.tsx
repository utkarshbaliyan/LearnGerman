"use client";

import { useEffect } from "react";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";
import { setCloudAuthenticated } from "@/app/lib/cloud-progress-save";
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
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("online", synchronizeWhenOnline);
    };
  }, []);
  return null;
}
