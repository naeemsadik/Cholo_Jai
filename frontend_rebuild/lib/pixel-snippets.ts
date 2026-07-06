// Pixel & script snippet generators.
//
// Admin pastes an ID (or a raw snippet for "custom"); we generate the
// canonical HTML the providers recommend. These run server-side in
// components/seo/injected-{head,body}.tsx.
//
// IMPORTANT — XSS surface:
// These snippets are only rendered into pages where an admin authored them
// (admin-only auth via /api/settings). Don't expose this module to public
// callers. The "custom" provider renders the admin's literal text — they can
// put anything in there, but they're trusted (admin-only).
//
// IMPORTANT — hydration correctness:
// gtag.js installs as TWO back-to-back <script> tags (a loader <script async
// src="..."></script> and an inline <script>window.dataLayer=...</script>).
// If we ever wrap that markup in another outer <script> body, the browser's
// HTML parser closes the outer <script> at the first inner </script>,
// truncating server HTML while React's client tree sees the full string →
// hydration mismatch. So we DON'T emit HTML strings; we emit a structured
// list of script descriptors that InjectedHead/InjectedBody renders as
// React <script> JSX elements with proper src/dangerouslySetInnerHTML —
// each one is a real, browser-recognized script with no nested parsing.

import type { AdminSettings, PixelCode, PixelProvider } from "./types";

/** Canonical placement per provider. Admin can override in the UI. */
export const DEFAULT_PLACEMENT: Record<PixelProvider, "head" | "body"> = {
  facebook: "body", // FB Pixel standard install: body-bottom
  google_analytics: "head", // gtag.js loader is fine in head
  tiktok: "head", // TikTok standard install: head
  custom: "head", // admin's call — they paste raw
};

/** Display labels for the provider Select. */
export const PROVIDER_LABEL: Record<PixelProvider, string> = {
  facebook: "Facebook Pixel",
  google_analytics: "Google Analytics 4",
  tiktok: "TikTok Pixel",
  custom: "Custom raw snippet",
};

/** Helper text shown below the ID input. */
export const PROVIDER_HINT: Record<PixelProvider, string> = {
  facebook: "Numeric Pixel ID (15+ digits). Found in Events Manager.",
  google_analytics: "Measurement ID, format G-XXXXXXX.",
  tiktok: "Pixel code (uppercase letters and digits).",
  custom: "Paste a complete <script>...</script> block. Trusted — admin only.",
};

/**
 * A descriptor for one browser-recognized script element. The render sites
 * turn these into JSX <script> elements with proper attributes.
 *
 * - `src` scripts use a real src attribute (no body) — React serializes them
 *   as `<script async src="..."></script>`. Safe in hydration because there
 *   is no inner </script> token.
 * - `inline` scripts use dangerouslySetInnerHTML with a body that is
 *   guaranteed NOT to contain "</script>" — see per-provider rules below.
 */
export type PixelScriptDescriptor =
  | { kind: "src"; src: string; async?: boolean }
  | { kind: "inline"; body: string };

/**
 * Render one pixel as a list of script descriptors (the things the browser
 * will actually load). Returns [] if disabled or missing required input.
 *
 * Per-provider rules to keep bodies </script>-free:
 *   - facebook: emits an inline fbq snippet (no inner </script>), plus a
 *     <noscript> fallback image. We surface the noscript as `inline` with
 *     the literal `<noscript>...</noscript>` markup, which renders fine in
 *     dangerouslySetInnerHTML because no </script> is involved.
 *   - google_analytics: emits ONE src script (the gtag loader) + ONE inline
 *     init script. The init body is plain JS — no </script>.
 *   - tiktok: emits ONE inline ttq snippet. Body is plain JS — no </script>.
 *   - custom: admin's literal — we trust them (admin-only auth). We surface
 *     it as `inline` with their text verbatim. If their text contains
 *     </script>, that's their responsibility; they should paste a
 *     self-contained snippet.
 */
export function renderPixel(pixel: PixelCode): PixelScriptDescriptor[] {
  if (!pixel.enabled) return [];
  const id = pixel.pixel_id.trim();
  if (!id) return [];

  switch (pixel.provider) {
    case "facebook": {
      const safeId = String(id).replace(/[^0-9]/g, "");
      if (!safeId) return [];
      const fbqBody =
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
        `n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;` +
        `n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);` +
        `t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}` +
        `(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
        `fbq('init','${safeId}');fbq('track','PageView');`;
      return [
        { kind: "inline", body: fbqBody },
        {
          kind: "inline",
          body: `<noscript><img height="1" width="1" alt="" src="https://www.facebook.com/tr?id=${safeId}&ev=PageView&noscript=1"/></noscript>`,
        },
      ];
    }
    case "google_analytics": {
      const safeId = String(id).replace(/[^A-Za-z0-9-]/g, "");
      if (!safeId) return [];
      const initBody =
        `window.dataLayer=window.dataLayer||[];` +
        `function gtag(){dataLayer.push(arguments)}` +
        `gtag('js',new Date());` +
        `gtag('config','${safeId}');`;
      return [
        {
          kind: "src",
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${safeId}`,
        },
        { kind: "inline", body: initBody },
      ];
    }
    case "tiktok": {
      const safeCode = String(id).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (!safeCode) return [];
      const ttqBody =
        `!function (w, d, t) {` +
        `w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];` +
        `ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};` +
        `for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);` +
        `ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};` +
        `ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};` +
        `var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;` +
        `var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};` +
        `ttq.load('${safeCode}');ttq.page();` +
        `}(window, document, 'ttq');`;
      return [{ kind: "inline", body: ttqBody }];
    }
    case "custom":
      // Admin's literal. We trust them — admin-only auth.
      return [{ kind: "inline", body: id }];
  }
}

/** Concatenate all head-placed pixel descriptors into one ordered list. */
export function renderHeadPixels(
  settings: AdminSettings,
): PixelScriptDescriptor[] {
  const out: PixelScriptDescriptor[] = [];
  for (const p of settings.pixels) {
    if (!p.enabled || p.placement !== "head") continue;
    out.push(...renderPixel(p));
  }
  return out;
}

/** Concatenate all body-placed pixel descriptors into one ordered list. */
export function renderBodyPixels(
  settings: AdminSettings,
): PixelScriptDescriptor[] {
  const out: PixelScriptDescriptor[] = [];
  for (const p of settings.pixels) {
    if (!p.enabled || p.placement !== "body") continue;
    out.push(...renderPixel(p));
  }
  return out;
}

/**
 * Format a list of script descriptors as a human-readable HTML string for
 * the admin's "preview" disclosure. The admin wants to see what their
 * snippet will look like; we render each descriptor as one or more
 * <script>/<noscript> tags.
 */
export function formatDescriptorsForPreview(
  descriptors: PixelScriptDescriptor[],
): string {
  if (descriptors.length === 0) return "";
  return descriptors
    .map((d) => {
      if (d.kind === "src") {
        return `<script async src="${d.src}"></script>`;
      }
      // inline — body may already contain <noscript>...</noscript> (FB Pixel
      // fallback img) or plain JS. Wrap in <script>...</script> unless it
      // already IS a noscript.
      if (d.body.trimStart().startsWith("<noscript")) return d.body;
      return `<script>${d.body}</script>`;
    })
    .join("\n");
}