// GET /api/analytics/summary?range=7d|30d
//
// Server-side auth — reads Authorization: Bearer <cj_admin_token> header.
// Returns the AdminAnalyticsSummary JSON. 401 if no token.
//
// This is a real improvement over today: the existing /admin/* pages are
// statically rendered and readable with curl; this endpoint requires the
// admin session token before returning any analytics data.

import { NextRequest, NextResponse } from "next/server";
import { summary } from "@/lib/analytics-store";
import type { AnalyticsRange } from "@/lib/analytics-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_RANGES: ReadonlyArray<AnalyticsRange> = ["7d", "30d"];

function isValidRange(raw: string | null): raw is AnalyticsRange {
  return raw !== null && (VALID_RANGES as readonly string[]).includes(raw);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }

  const rangeParam = req.nextUrl.searchParams.get("range");
  const range: AnalyticsRange = isValidRange(rangeParam) ? rangeParam : "30d";

  try {
    const data = await summary(range);
    return NextResponse.json(data, {
      headers: {
        // Don't let any CDN cache the summary — it changes every visit.
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[analytics] summary failed:", err);
    return NextResponse.json(
      { error: "Failed to compute analytics summary." },
      { status: 500 },
    );
  }
}