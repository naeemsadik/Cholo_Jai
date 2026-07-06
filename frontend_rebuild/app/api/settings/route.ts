// /api/settings — read & write the singleton settings blob.
//
// GET: returns the current settings JSON. Auth-gated.
// PUT: replaces/merges the body with current settings, stamps updated_at,
//      persists via lib/settings-store.ts atomic write. Auth-gated.
//
// Token auth matches the analytics routes: `Authorization: Bearer <cj_admin_token>`.
// Both header presence (any non-empty bearer value) and length > 0.

import { NextRequest, NextResponse } from "next/server";

import { readSettings, writeSettings } from "@/lib/settings-store";
import type { AdminSettings, MetaTag, PixelCode } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return Boolean(match && match[1].trim());
}

function isPixelArray(value: unknown): value is PixelCode[] {
  return Array.isArray(value);
}

function isMetaArray(value: unknown): value is MetaTag[] {
  return Array.isArray(value);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }
  try {
    const data = await readSettings();
    return NextResponse.json(data, {
      headers: {
        // Settings may change at any time — don't let any CDN cache them.
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[settings] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to read settings." },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }

  let body: Partial<AdminSettings> | null = null;
  try {
    const parsed: unknown = await req.json();
    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json(
        { error: "Body must be a JSON object." },
        { status: 400 },
      );
    }
    body = parsed as Partial<AdminSettings>;
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON." },
      { status: 400 },
    );
  }

  try {
    const current = await readSettings();
    // Merge top-level fields if they have a sensible type. The two array
    // fields (pixels, meta_tags) are replaced wholesale — admin always sends
    // the full list, so we trust the client.
    const next: AdminSettings = {
      ...current,
      ...(typeof body.site_name === "string" && { site_name: body.site_name }),
      ...(typeof body.tagline === "string" && { tagline: body.tagline }),
      ...(typeof body.default_city === "string" && {
        default_city: body.default_city,
      }),
      ...(typeof body.default_outbound_label === "string" && {
        default_outbound_label: body.default_outbound_label,
      }),
      ...(Array.isArray(body.outbound_labels) && {
        outbound_labels: body.outbound_labels,
      }),
      ...(isPixelArray(body.pixels) && { pixels: body.pixels }),
      ...(isMetaArray(body.meta_tags) && { meta_tags: body.meta_tags }),
    };

    const saved = await writeSettings(next);
    return NextResponse.json(saved);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[settings] PUT failed:", err);
    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 },
    );
  }
}