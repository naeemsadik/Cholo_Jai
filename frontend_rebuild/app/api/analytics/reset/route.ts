// POST /api/analytics/reset
//
// Truncates data/analytics.ndjson. Auth-gated. Destructive — but the user
// (admin) explicitly confirms via a Dialog in /admin/settings before this
// is called. Use sparingly.

import { NextRequest, NextResponse } from "next/server";
import { resetAll } from "@/lib/analytics-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }
  try {
    await resetAll();
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[analytics] reset failed:", err);
    return NextResponse.json(
      { error: "Failed to reset analytics." },
      { status: 500 },
    );
  }
}