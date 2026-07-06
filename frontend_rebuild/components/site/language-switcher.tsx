// Language switcher — a two-letter pill that flips the active locale.
// Renders the *target* language (so a Bangla reader sees "EN" — meaning
// "tap to switch to English"), which matches the convention used by every
// bilingual Bangla/English news site in BD.
//
// We use a Server Action to set the cookie + revalidate the layout, so
// the new language is reflected on the very next render — no English flash
// between click and re-render.
//
// The switcher has two states — EN and বাং — and shows the active state
// with the brand orange. Sits in the navbar.

"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useLocale } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/types";

const TARGET_LABEL: Record<Locale, string> = {
  bn: "EN",
  en: "বাং",
};

// aria-labels describe the action, not the state
const TARGET_FULL: Record<Locale, string> = {
  bn: "Switch to English",
  en: "বাংলায় পড়ুন",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const target: Locale = locale === "bn" ? "en" : "bn";
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = React.useState(false);

  async function onSwitch() {
    if (pending) return;
    setPending(true);
    try {
      await setLocaleAction(target);
      // Refresh server-rendered content with the new dictionary.
      router.refresh();
      // Keep the user on the same path; the layout re-render handles
      // re-resolution of the dictionary.
      void pathname;
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onSwitch}
      disabled={pending}
      aria-label={TARGET_FULL[locale]}
      title={TARGET_FULL[locale]}
      className={cn(
        "inline-flex h-9 min-w-[3rem] items-center justify-center rounded-full border border-rule bg-paper px-3 text-sm font-semibold tracking-wide text-ink-700 transition-all",
        "hover:border-ink-300 hover:bg-cream-50 hover:text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-300",
        "disabled:cursor-progress disabled:opacity-60",
        className,
      )}
    >
      {TARGET_LABEL[locale]}
    </button>
  );
}
