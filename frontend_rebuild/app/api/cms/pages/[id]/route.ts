// /api/cms/pages/[id] — read & write a single CMS page's content blocks.
//
// URL: /api/cms/pages/about
// GET: returns { id, blocks, updated_at }
// PUT: replaces blocks for that page (admin sends the full block list)

import { NextRequest, NextResponse } from "next/server";
import { readCmsPage, writeCmsPage, type CmsBlock } from "@/lib/cms-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return Boolean(match && match[1].trim());
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  const page = await readCmsPage(params.id);
  if (!page) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }
  return NextResponse.json(page, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  let blocks: CmsBlock[] | null = null;
  try {
    const parsed: unknown = await req.json();
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { blocks?: unknown }).blocks)
    ) {
      return NextResponse.json(
        { error: "Body must be { blocks: CmsBlock[] }." },
        { status: 400 },
      );
    }
    blocks = (parsed as { blocks: CmsBlock[] }).blocks;
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }
  try {
    const saved = await writeCmsPage(params.id, blocks);
    return NextResponse.json(saved);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[cms/pages] PUT failed:", err);
    return NextResponse.json({ error: "Failed to save page." }, { status: 500 });
  }
}
