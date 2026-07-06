// Re-exports — one import path for the rest of the app.
//
// We deliberately DON'T `export * from "./server"` here — server.ts uses
// `next/headers` and crashes the build when bundled into a client component
// (e.g. the navbar). Import from "@/lib/i18n/server" directly for server-side
// helpers; import from "@/lib/i18n/client" for client hooks.
//
//   import { useT, useLocale, useDict } from "@/lib/i18n/client";
//   import { serverT, getLocaleFromHeaders, getDictionary } from "@/lib/i18n/server";
//   import { setLocaleAction } from "@/lib/i18n/actions";
//   import { LOCALE_LABEL, type Locale } from "@/lib/i18n/types";

export * from "./types";
export { type Dictionary } from "./types-dict";
export {
  I18nProvider,
  useI18n,
  useT,
  useLocale,
  useDict,
  type DictKey,
  getActiveDictionary,
  setActiveDictionary,
  getActiveLocale,
} from "./client";
export * from "./actions";
export * from "./format";
export * from "./event";
