// GET /api/analytics/event/[eventId]?range=7d|30d
//
// Server-side auth — reads Authorization: Bearer <cj_admin_token> header.
// Returns the EventAnalyticsDetail JSON. 401 if no token.

import { NextRequest, NextResponse } from "next/server";
import { eventDetail } from "@/lib/analytics-store";
import type { AnalyticsRange } from "@/lib/analytics-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_RANGES: ReadonlyArray<AnalyticsRange> = ["7d", "30d"];

function isValidRange(raw: string | null): raw is AnalyticsRange {
  return raw !== null && (VALID_RANGES as readonly string[]).includes(raw);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }

  const { eventId } = params;
  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID is required." },
      { status: 400 },
    );
  }

  const rangeParam = req.nextUrl.searchParams.get("range");
  const range: AnalyticsRange = isValidRange(rangeParam) ? rangeParam : "30d";

  try {
    const data = await eventDetail(eventId, range);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[analytics] eventDetail failed for ${eventId}:`, err);
    return NextResponse.json(
      { error: "Failed to compute event analytics detail." },
      { status: 500 },
    );
  }
}
