"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  FileText,
  Plus,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import { adminListCmsPages } from "@/lib/api";
import type { CmsPageListItem } from "@/lib/api";

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CmsListView() {
  const [pages, setPages] = React.useState<CmsPageListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminListCmsPages();
      if (!mounted) return;
      if (res.data && Array.isArray(res.data)) {
        setPages(res.data);
      } else {
        setError(res.error ?? "Could not load CMS pages.");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <AdminSectionHeader
        eyebrow="CMS"
        title="Pages"
        description="Generic block-based pages for the public site. The about page is the first one — add more by inserting a new entry in data/cms.json and it will appear here automatically."
      />

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading pages…
        </div>
      ) : error ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-ember-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : pages.length === 0 ? (
        <Card className="mt-10 p-10 text-center">
          <FileText className="mx-auto h-6 w-6 text-ink-400" />
          <h3 className="mt-3 font-display text-lg tracking-tight text-ink">
            No CMS pages yet.
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Add an entry to <code className="rounded bg-cream-200 px-1 font-mono text-xs">data/cms.json</code> to get started.
          </p>
        </Card>
      ) : (
        <div className="mt-10 grid gap-3">
          {pages.map((p) => (
            <Card
              key={p.id}
              className="group flex items-center gap-4 p-4 transition-all hover:border-ink-300"
            >
              <div className="rounded-md bg-cream-100 p-2 text-ink-700">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-medium text-ink">
                    {p.id === "about" ? "About" : p.id}
                  </h3>
                  <span className="rounded-full bg-cream-100 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-ink-500">
                    {p.id}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatUpdated(p.updated_at)}
                  </span>
                  <span>·</span>
                  <span>
                    {p.block_count} {p.block_count === 1 ? "block" : "blocks"}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={p.id === "about" ? "/about" : `/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/cms/${encodeURIComponent(p.id)}`}>
                    Edit
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-md border border-dashed border-rule bg-cream-50 p-6 text-sm text-ink-500">
        <p>
          <span className="font-medium text-ink">Adding a new page:</span> create a new entry in{" "}
          <code className="rounded bg-cream-200 px-1 font-mono text-xs">data/cms.json</code>{" "}
          with an{" "}
          <code className="rounded bg-cream-200 px-1 font-mono text-xs">id</code>,{" "}
          <code className="rounded bg-cream-200 px-1 font-mono text-xs">updated_at</code>, and an
          empty{" "}
          <code className="rounded bg-cream-200 px-1 font-mono text-xs">blocks: []</code> array.
          The page will appear here and the public route at{" "}
          <code className="rounded bg-cream-200 px-1 font-mono text-xs">/{`{id}`}</code> will resolve
          to the same template.
        </p>
      </div>
    </>
  );
}
