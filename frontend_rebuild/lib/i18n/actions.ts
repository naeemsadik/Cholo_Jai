// Server Action: switch the user's locale by setting the cj_locale cookie.
//
// Why a Server Action (not a client-only setCookie):
//   - Server Actions can call `cookies().set()` which is reliable across
//     server-side and client-side execution. The first render after the
//     switch is in the right language — no English flash.
//   - The action returns void; the client component navigates to refresh.

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_KEY, LOCALES, type Locale } from "./types";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(next: Locale): Promise<void> {
  if (!LOCALES.includes(next)) return;
  const c = await cookies();
  c.set(COOKIE_KEY, next, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: false, // intentionally readable from client for the toggle UI
  });
  // Invalidate the page tree so the new language is reflected immediately.
  revalidatePath("/", "layout");
}
