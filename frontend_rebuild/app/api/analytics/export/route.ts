// GET /api/analytics/export
//
// Auth-gated download of the raw NDJSON file. Streams the bytes back with a
// Content-Disposition: attachment header so admins can save a copy.

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NDJSON_PATH = path.join(process.cwd(), "data", "analytics.ndjson");

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    return NextResponse.json(
      { error: "Admin session required." },
      { status: 401 },
    );
  }

  let body = "";
  try {
    body = await fs.readFile(NDJSON_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      body = ""; // Empty export — send an empty file rather than 404.
    } else {
      return NextResponse.json(
        { error: "Failed to read analytics store." },
        { status: 500 },
      );
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Content-Disposition": `attachment; filename="ghurighuri-analytics-${stamp}.ndjson"`,
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}