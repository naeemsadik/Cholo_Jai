"use client";

import * as React from "react";
import { AlertCircle, X } from "lucide-react";

interface FallbackBannerProps {
  message?: string;
  onDismiss?: () => void;
}

export function FallbackBanner({ message, onDismiss }: FallbackBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div className="border-b border-accent-100 bg-accent-50">
      <div className="editorial-container py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-accent-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {message || "Demo mode — showing sample events. Live data will appear once the backend is connected."}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            aria-label="Dismiss banner"
            className="rounded p-1 text-accent-700 hover:bg-accent-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}