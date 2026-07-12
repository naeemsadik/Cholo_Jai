"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface ShareButtonsProps {
  title: string;
  slug: string;
  startDate: string;
}

export function ShareButtons({ title, slug, startDate }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const eventPath = React.useMemo(() => `/events/${slug}`, [slug]);
  const [url, setUrl] = React.useState(eventPath);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(`${window.location.origin}${eventPath}`);
  }, [eventPath]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Paste it into a message or status.", variant: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Long-press the address bar to copy manually.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-2">
      <span className="eyebrow">Share</span>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-rule bg-paper px-3 py-2 text-xs font-medium hover:border-ink transition-colors"
        >
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-rule bg-paper px-3 py-2 text-xs font-medium hover:border-ink transition-colors"
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-rule bg-paper px-3 py-2 text-xs font-medium hover:border-ink transition-colors"
        >
          Twitter
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rule bg-paper px-3 py-2 text-xs font-medium hover:border-ink transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
