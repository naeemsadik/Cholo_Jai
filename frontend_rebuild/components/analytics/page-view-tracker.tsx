"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/api";
import { useDataSource } from "@/components/site/data-source-context";

export function PageViewTracker({ eventId }: { eventId?: string }) {
  const { source } = useDataSource();
  useEffect(() => {
    if (source !== "live") return;
    void trackEvent("page_view", { event_id: eventId });
  }, [eventId, source]);
  return null;
}