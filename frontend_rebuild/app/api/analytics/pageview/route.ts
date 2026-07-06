// POST /api/analytics/pageview
//
// Best-effort fire-and-forget pageview tracking. Returns 204 immediately —
// analytics must never block the user experience.
//
// Public — anyone can call this (it's just a pageview counter), but we still
// validate the payload shape so a misbehaving client can't poison the NDJSON
// store with junk rows.

import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics-store";
import type { PageviewPayload } from "@/lib/analytics-types";

// Force dynamic — no caching, no prerender. This route is a write endpoint.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PATH_LEN = 512;
const MAX_REF_LEN = 512;
const MAX_UTM_LEN = 128;

function sanitizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_PATH_LEN) return null;
  // Only allow relative paths starting with "/" — drop full URLs to avoid leaks.
  if (!trimmed.startsWith("/")) return null;
  return trimmed;
}

function sanitizeOptionalString(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function getOrCreateSessionId(req: NextRequest): string {
  const fromHeader = req.headers.get("x-ghurighuri-session");
  if (fromHeader && /^[a-zA-Z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  // crypto.randomUUID is available on the edge runtime + Node 18+.
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  let body: Partial<PageviewPayload> = {};
  try {
    body = (await req.json()) as Partial<PageviewPayload>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const path = sanitizePath(body.path);
  if (!path) return new NextResponse(null, { status: 400 });

  const session_id = getOrCreateSessionId(req);
  // Fire and forget — don't await before responding.
  void recordEvent({
    type: "page_view",
    session_id,
    path,
    ref: sanitizeOptionalString(body.ref, MAX_REF_LEN),
    utm_source: sanitizeOptionalString(body.utm_source, MAX_UTM_LEN),
  });

  return new NextResponse(null, { status: 204 });
}