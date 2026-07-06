// /api/cms/home — read & write the homepage section config.

import { NextRequest, NextResponse } from "next/server";
import { readHomeConfig, writeHomeConfig } from "@/lib/cms-store";
import type { HomePageConfig } from "@/lib/cms-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return Boolean(match && match[1].trim());
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  try {
    const home = await readHomeConfig();
    return NextResponse.json(home, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[cms/home] GET failed:", err);
    return NextResponse.json({ error: "Failed to read home config." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  let body: HomePageConfig | null = null;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({ error: "Body must be a JSON object." }, { status: 400 });
    }
    body = parsed as HomePageConfig;
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }
  try {
    const saved = await writeHomeConfig(body);
    return NextResponse.json(saved);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[cms/home] PUT failed:", err);
    return NextResponse.json({ error: "Failed to save home config." }, { status: 500 });
  }
}
