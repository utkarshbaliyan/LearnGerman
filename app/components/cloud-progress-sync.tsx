"use client";

import { useEffect } from "react";

import { synchronizeCloudProgress } from "@/app/lib/cloud-progress";

export function CloudProgressSync() {
  useEffect(() => { void synchronizeCloudProgress().catch(() => {}); }, []);
  return null;
}
