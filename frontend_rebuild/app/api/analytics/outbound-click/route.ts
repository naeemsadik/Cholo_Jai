// POST /api/analytics/outbound-click
//
// Tracks when a visitor clicks an outbound CTA on an event page.
// event_id must be a non-empty string; label/href are metadata-only and
// never returned in summary output (only used for audit/debugging).

import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics-store";
import type { OutboundClickPayload } from "@/lib/analytics-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ID = 128;
const MAX_LABEL = 64;
const MAX_HREF = 1024;

function getOrCreateSessionId(req: NextRequest): string {
  const fromHeader = req.headers.get("x-ghurighuri-session");
  if (fromHeader && /^[a-zA-Z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  return crypto.randomUUID();
}

function sanitizeString(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(req: NextRequest) {
  let body: Partial<OutboundClickPayload> = {};
  try {
    body = (await req.json()) as Partial<OutboundClickPayload>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const event_id = sanitizeString(body.event_id, MAX_ID);
  if (!event_id) return new NextResponse(null, { status: 400 });

  const session_id = getOrCreateSessionId(req);

  void recordEvent({
    type: "outbound_click",
    session_id,
    event_id,
    meta: {
      label: sanitizeString(body.label, MAX_LABEL),
      href: sanitizeString(body.href, MAX_HREF),
    },
  });

  return new NextResponse(null, { status: 204 });
}