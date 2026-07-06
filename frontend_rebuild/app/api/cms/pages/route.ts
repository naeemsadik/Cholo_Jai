// /api/cms/pages — list all CMS pages (id + updated_at + block_count).
// Used by /admin/cms to render the page index.

import { NextRequest, NextResponse } from "next/server";
import { readCms } from "@/lib/cms-store";

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
    const state = await readCms();
    const pages = Object.values(state.pages).map((p) => ({
      id: p.id,
      updated_at: p.updated_at,
      block_count: p.blocks.length,
    }));
    return NextResponse.json(
      { pages },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[cms/pages] GET failed:", err);
    return NextResponse.json({ error: "Failed to list pages." }, { status: 500 });
  }
}
