// POST /api/analytics/event
//
// Generic form_completion sink — newsletter signup, submission, contact form.
// Payload is small (form_id + optional meta). No PII, no email addresses.

import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics-store";
import type { EventCompletionPayload } from "@/lib/analytics-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_FORM_IDS = new Set([
  "newsletter",
  "submission",
  "contact",
  "report_issue",
]);

const MAX_FORM_ID = 64;
const MAX_META_KEY = 64;
const MAX_META_VALUE = 256;

function getOrCreateSessionId(req: NextRequest): string {
  const fromHeader = req.headers.get("x-ghurighuri-session");
  if (fromHeader && /^[a-zA-Z0-9._-]{8,128}$/.test(fromHeader)) return fromHeader;
  return crypto.randomUUID();
}

function sanitizeFormId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > MAX_FORM_ID) return null;
  return ALLOWED_FORM_IDS.has(trimmed) ? trimmed : null;
}

function sanitizeMeta(raw: unknown): Record<string, string | number | boolean | null> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || k.length === 0 || k.length > MAX_META_KEY) continue;
    if (k.startsWith("__")) continue; // reserved
    if (typeof v === "string") {
      out[k] = v.slice(0, MAX_META_VALUE);
    } else if (typeof v === "number" || typeof v === "boolean" || v === null) {
      out[k] = v;
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: Partial<EventCompletionPayload> = {};
  try {
    body = (await req.json()) as Partial<EventCompletionPayload>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const form_id = sanitizeFormId(body.form_id);
  if (!form_id) return new NextResponse(null, { status: 400 });

  const session_id = getOrCreateSessionId(req);

  void recordEvent({
    type: "form_completion",
    session_id,
    meta: { form_id, ...sanitizeMeta(body.meta) },
  });

  return new NextResponse(null, { status: 204 });
}