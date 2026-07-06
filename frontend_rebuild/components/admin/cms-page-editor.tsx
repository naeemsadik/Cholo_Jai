"use client";

import * as React from "react";
import {
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUpRight,
  GripVertical,
  Check,
  CircleDot,
  RotateCcw,
  X,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List as ListIcon,
  HelpCircle,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import { adminGetCmsPage, adminUpdateCmsPage } from "@/lib/api";
import type { CmsBlock } from "@/lib/cms-store";

type SaveState = "saved" | "saving" | "dirty" | "error";
const AUTOSAVE_DELAY_MS = 1500;

const BLOCK_KINDS = [
  { kind: "heading", label: "Heading", icon: Heading1 },
  { kind: "paragraph", label: "Paragraph", icon: Pilcrow },
  { kind: "list", label: "List", icon: ListIcon },
  { kind: "faq", label: "FAQ", icon: HelpCircle },
  { kind: "image", label: "Image", icon: ImageIcon },
] as const;

type BlockKind = (typeof BLOCK_KINDS)[number]["kind"];

function blockIcon(kind: string): React.ComponentType<{ className?: string }> {
  switch (kind) {
    case "heading":
      return Heading1;
    case "paragraph":
      return Pilcrow;
    case "list":
      return ListIcon;
    case "faq":
      return HelpCircle;
    case "image":
      return ImageIcon;
    default:
      return Pilcrow;
  }
}

function blockLabel(kind: string): string {
  return BLOCK_KINDS.find((k) => k.kind === kind)?.label ?? kind;
}

function emptyBlock(kind: BlockKind): CmsBlock {
  switch (kind) {
    case "heading":
      return { kind: "heading", level: 2, en: "", bn: "" };
    case "paragraph":
      return { kind: "paragraph", en: "", bn: "" };
    case "list":
      return { kind: "list", items: [{ en: "", bn: "" }] };
    case "faq":
      return { kind: "faq", items: [{ q: { en: "", bn: "" }, a: { en: "", bn: "" } }] };
    case "image":
      return { kind: "image", src: "", alt: { en: "", bn: "" } };
  }
}

// ── SaveIndicator ────────────────────────────────────────────────────
function SaveIndicator({
  state,
  lastSavedAt,
  onManualSave,
}: {
  state: SaveState;
  lastSavedAt: string | null;
  onManualSave: () => void;
}) {
  const rel = (iso: string | null) => {
    if (!iso) return "never";
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };
  let icon: React.ReactNode = null;
  let label: React.ReactNode = "";
  let tone = "text-ink-500";
  let bg = "";
  switch (state) {
    case "saved":
      icon = <Check className="h-3.5 w-3.5 text-accent-700" />;
      label = (
        <>
          Saved{" "}
          <span className="font-mono text-ink-500">{rel(lastSavedAt)}</span>
        </>
      );
      break;
    case "saving":
      icon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      label = "Saving…";
      break;
    case "dirty":
      icon = <CircleDot className="h-3.5 w-3.5 text-ember-600" />;
      label = "Unsaved · auto-save soon";
      tone = "text-ember-700";
      break;
    case "error":
      icon = <AlertTriangle className="h-3.5 w-3.5 text-ember" />;
      label = "Save failed · click to retry";
      tone = "text-ember";
      bg = "bg-ember-50";
      break;
  }
  return (
    <button
      type="button"
      onClick={state === "error" ? onManualSave : undefined}
      disabled={state === "saving" || state === "saved"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
        state === "error" ? `hover:bg-ember-100 ${bg}` : ""
      } ${tone}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

// ── Block editor ─────────────────────────────────────────────────────
function BlockEditor({
  block,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  block: CmsBlock;
  onChange: (next: CmsBlock) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const Icon = blockIcon(block.kind);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-rule bg-cream-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-ink-400">
            <GripVertical className="h-4 w-4" />
          </span>
          <Icon className="h-4 w-4 text-ink-700" />
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-700">
            {blockLabel(block.kind)}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label="Move up"
            title="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label="Move down"
            title="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove block"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {block.kind === "heading" && (
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-2">
              <Label className="mb-1.5 inline-block text-xs">Level</Label>
              <select
                value={String(block.level)}
                onChange={(e) =>
                  onChange({
                    ...block,
                    level: (Number(e.target.value) || 2) as 1 | 2 | 3,
                  })
                }
                className="h-10 w-full rounded-md border border-rule bg-paper px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember-300"
              >
                <option value="1">H1</option>
                <option value="2">H2</option>
                <option value="3">H3</option>
              </select>
            </div>
            <div className="md:col-span-5">
              <Label className="mb-1.5 inline-block text-xs">English</Label>
              <Input
                value={block.en}
                onChange={(e) => onChange({ ...block, en: e.target.value })}
              />
            </div>
            <div className="md:col-span-5">
              <Label className="mb-1.5 inline-block text-xs">Bangla</Label>
              <Input
                value={block.bn ?? ""}
                onChange={(e) => onChange({ ...block, bn: e.target.value })}
              />
            </div>
          </div>
        )}

        {block.kind === "paragraph" && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 inline-block text-xs">English</Label>
              <Textarea
                rows={5}
                value={block.en}
                onChange={(e) => onChange({ ...block, en: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5 inline-block text-xs">Bangla</Label>
              <Textarea
                rows={5}
                value={block.bn ?? ""}
                onChange={(e) => onChange({ ...block, bn: e.target.value })}
              />
            </div>
          </div>
        )}

        {block.kind === "list" && (
          <div className="space-y-2">
            {block.items.map((it, idx) => (
              <div key={idx} className="grid gap-2 rounded-md border border-rule bg-paper p-2 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Input
                    value={it.en}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        items: block.items.map((x, i) =>
                          i === idx ? { ...x, en: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="List item"
                  />
                </div>
                <div className="md:col-span-5">
                  <Input
                    value={it.bn ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        items: block.items.map((x, i) =>
                          i === idx ? { ...x, bn: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="তালিকার আইটেম"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    value={it.href ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        items: block.items.map((x, i) =>
                          i === idx ? { ...x, href: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="https://…"
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange({
                    ...block,
                    items: [...block.items, { en: "", bn: "" }],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add item
              </Button>
            </div>
          </div>
        )}

        {block.kind === "faq" && (
          <div className="space-y-3">
            {block.items.map((item, idx) => (
              <div key={idx} className="rounded-md border border-rule bg-paper p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-ink-500">
                    Item {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, i) => i !== idx),
                      })
                    }
                    aria-label="Remove FAQ item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label className="mb-1 inline-block text-xs">Question · English</Label>
                    <Input
                      value={item.q.en}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          items: block.items.map((x, i) =>
                            i === idx
                              ? { ...x, q: { ...x.q, en: e.target.value } }
                              : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1 inline-block text-xs">Question · Bangla</Label>
                    <Input
                      value={item.q.bn ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          items: block.items.map((x, i) =>
                            i === idx
                              ? { ...x, q: { ...x.q, bn: e.target.value } }
                              : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1 inline-block text-xs">Answer · English</Label>
                    <Textarea
                      rows={3}
                      value={item.a.en}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          items: block.items.map((x, i) =>
                            i === idx
                              ? { ...x, a: { ...x.a, en: e.target.value } }
                              : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1 inline-block text-xs">Answer · Bangla</Label>
                    <Textarea
                      rows={3}
                      value={item.a.bn ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          items: block.items.map((x, i) =>
                            i === idx
                              ? { ...x, a: { ...x.a, bn: e.target.value } }
                              : x,
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange({
                    ...block,
                    items: [
                      ...block.items,
                      { q: { en: "", bn: "" }, a: { en: "", bn: "" } },
                    ],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add FAQ item
              </Button>
            </div>
          </div>
        )}

        {block.kind === "image" && (
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <Label className="mb-1.5 inline-block text-xs">Image URL</Label>
              <Input
                value={block.src}
                onChange={(e) => onChange({ ...block, src: e.target.value })}
                placeholder="/img/about-hero.jpg or https://…"
              />
              <p className="mt-1 text-[0.65rem] text-ink-500">
                Use a public URL or a path served from <code>/public</code>.
              </p>
            </div>
            <div className="md:col-span-3">
              <Label className="mb-1.5 inline-block text-xs">Alt · English</Label>
              <Input
                value={block.alt.en}
                onChange={(e) =>
                  onChange({
                    ...block,
                    alt: { ...block.alt, en: e.target.value },
                  })
                }
              />
            </div>
            <div className="md:col-span-3">
              <Label className="mb-1.5 inline-block text-xs">Alt · Bangla</Label>
              <Input
                value={block.alt.bn ?? ""}
                onChange={(e) =>
                  onChange({
                    ...block,
                    alt: { ...block.alt, bn: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main view ────────────────────────────────────────────────────────

export function CmsPageEditor({ pageId }: { pageId: string }) {
  const [initialBlocks, setInitialBlocks] = React.useState<CmsBlock[] | null>(null);
  const [blocks, setBlocks] = React.useState<CmsBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // ── Load ──
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminGetCmsPage(pageId);
      if (!mounted) return;
      if (res.data && Array.isArray(res.data.blocks)) {
        const loaded = res.data.blocks as CmsBlock[];
        setInitialBlocks(loaded);
        setBlocks(loaded);
        setLastSavedAt(res.data.updated_at ?? null);
      } else {
        setLoadError(res.error ?? "Could not load page.");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [pageId]);

  // ── Auto-save ──
  React.useEffect(() => {
    if (saveState !== "dirty") return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      const res = await adminUpdateCmsPage(pageId, blocks);
      if (res.data) {
        setInitialBlocks(res.data.blocks as CmsBlock[]);
        setBlocks(res.data.blocks as CmsBlock[]);
        setLastSavedAt(res.data.updated_at ?? null);
        setSaveState("saved");
      } else {
        setSaveState("error");
        toast({
          title: "Could not save page",
          description: res.error ?? "Please retry.",
          variant: "destructive",
        });
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [saveState, blocks, pageId]);

  function markDirty(next: CmsBlock[]) {
    setBlocks(next);
    setSaveState("dirty");
  }

  function patchBlock(idx: number, next: CmsBlock) {
    markDirty(blocks.map((b, i) => (i === idx ? next : b)));
  }
  function removeBlock(idx: number) {
    markDirty(blocks.filter((_, i) => i !== idx));
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [removed] = next.splice(idx, 1);
    next.splice(target, 0, removed);
    markDirty(next);
  }
  function addBlock(kind: BlockKind) {
    markDirty([...blocks, emptyBlock(kind)]);
    setAddOpen(false);
  }

  function resetToLoaded() {
    if (initialBlocks) {
      setBlocks(initialBlocks);
      setSaveState("saved");
      toast({ title: "Reverted", description: "Restored last saved version." });
    }
    setConfirmReset(false);
  }

  async function manualSave() {
    if (saveState === "saving") return;
    setSaveState("saving");
    const res = await adminUpdateCmsPage(pageId, blocks);
    if (res.data) {
      setInitialBlocks(res.data.blocks as CmsBlock[]);
      setBlocks(res.data.blocks as CmsBlock[]);
      setLastSavedAt(res.data.updated_at ?? null);
      setSaveState("saved");
      toast({
        title: "Page saved",
        description: "Public page reflects these changes on the next render.",
        variant: "success",
      });
    } else {
      setSaveState("error");
      toast({
        title: "Could not save",
        description: res.error ?? "Please retry.",
        variant: "destructive",
      });
    }
  }

  // Coverage: % of blocks that have at least one non-empty BN field.
  const coverage = React.useMemo(() => {
    if (blocks.length === 0) return 0;
    let covered = 0;
    for (const b of blocks) {
      switch (b.kind) {
        case "heading":
        case "paragraph":
          if ((b.bn ?? "").trim().length > 0) covered++;
          break;
        case "list":
          if (b.items.some((it) => (it.bn ?? "").trim().length > 0)) covered++;
          break;
        case "faq":
          if (
            b.items.some(
              (it) =>
                (it.q.bn ?? "").trim().length > 0 ||
                (it.a.bn ?? "").trim().length > 0,
            )
          )
            covered++;
          break;
        case "image":
          if ((b.alt.bn ?? "").trim().length > 0) covered++;
          break;
      }
    }
    return Math.round((covered / blocks.length) * 100);
  }, [blocks]);

  if (loading || !initialBlocks) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadError ? `Page "${pageId}": ${loadError}` : `Loading page "${pageId}"…`}
      </div>
    );
  }

  const pageTitle = pageId === "about" ? "About" : pageId.charAt(0).toUpperCase() + pageId.slice(1);
  const publicPath = pageId === "about" ? "/about" : `/${pageId}`;

  return (
    <>
      <AdminSectionHeader
        eyebrow={`CMS · ${pageId}`}
        title={pageTitle}
        description="Edit the public page's content blocks. Bangla fields are optional — readers will see the English fallback when a block has no Bangla copy. Changes auto-save."
        actions={
          <div className="flex items-center gap-2">
            <SaveIndicator
              state={saveState}
              lastSavedAt={lastSavedAt}
              onManualSave={manualSave}
            />
            <Button asChild variant="outline" size="sm">
              <a href={publicPath} target="_blank" rel="noopener noreferrer">
                View page
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            {saveState === "dirty" && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" />
                Revert
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-10 grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="eyebrow">Blocks</span>
              <p className="mt-1 text-xs text-ink-500">
                {blocks.length} {blocks.length === 1 ? "block" : "blocks"} ·
                <span className="ml-2 inline-flex items-center gap-1">
                  Bangla coverage
                  <span
                    className={
                      coverage >= 80
                        ? "rounded-full bg-accent-50 px-2 py-0.5 font-mono text-[0.65rem] text-accent-700"
                        : coverage >= 40
                          ? "rounded-full bg-ember-50 px-2 py-0.5 font-mono text-[0.65rem] text-ember-700"
                          : "rounded-full bg-cream-200 px-2 py-0.5 font-mono text-[0.65rem] text-ink-500"
                    }
                  >
                    {coverage}%
                  </span>
                </span>
              </p>
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add block
            </Button>
          </div>

          {blocks.length === 0 ? (
            <Card className="p-10 text-center">
              <Type className="mx-auto h-6 w-6 text-ink-400" />
              <h3 className="mt-3 font-display text-lg tracking-tight text-ink">
                No blocks yet.
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Click <span className="font-medium text-ink">Add block</span> to insert a heading,
                paragraph, list, FAQ, or image.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {blocks.map((b, idx) => (
                <BlockEditor
                  key={idx}
                  block={b}
                  onChange={(next) => patchBlock(idx, next)}
                  onRemove={() => removeBlock(idx)}
                  onMove={(dir) => moveBlock(idx, dir)}
                  isFirst={idx === 0}
                  isLast={idx === blocks.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="md:col-span-4 space-y-4">
          <Card className="p-5">
            <span className="eyebrow">Status</span>
            <h3 className="mt-2 font-display text-lg tracking-tight">Last saved</h3>
            <p className="mt-2 text-sm text-ink-500">
              {lastSavedAt
                ? new Date(lastSavedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <div className="mt-3">
              <SaveIndicator
                state={saveState}
                lastSavedAt={lastSavedAt}
                onManualSave={manualSave}
              />
            </div>
          </Card>

          <Card className="p-5">
            <span className="eyebrow">Coverage</span>
            <h3 className="mt-2 font-display text-lg leading-tight tracking-tight">
              Bangla translation
            </h3>
            <p className="mt-1 text-xs text-ink-500">
              {coverage}% of blocks have at least some Bangla copy. Empty Bangla fields fall
              back to English automatically.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
              <div
                className={
                  coverage >= 80
                    ? "h-full bg-accent-500 transition-all"
                    : coverage >= 40
                      ? "h-full bg-ember transition-all"
                      : "h-full bg-ink-300 transition-all"
                }
                style={{ width: `${coverage}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 border-ember-100 bg-ember-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-ember-700" />
              <span className="eyebrow text-ember-700">Tip</span>
            </div>
            <p className="mt-2 text-xs text-ember-700 leading-relaxed">
              Generic pages are routed at{" "}
              <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem] text-ember-800">
                {publicPath}
              </code>
              . Only <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem] text-ember-800">about</code>{" "}
              has a dedicated template — other pages need a route handler to render.
            </p>
          </Card>
        </aside>
      </div>

      {/* Add block sheet */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a block</DialogTitle>
            <DialogDescription>
              Pick a block type. You can fill it in after.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BLOCK_KINDS.map((b) => {
              const Icon = b.icon;
              return (
                <button
                  key={b.kind}
                  type="button"
                  onClick={() => addBlock(b.kind)}
                  className="flex flex-col items-center gap-2 rounded-md border border-rule bg-paper p-4 text-center transition-colors hover:border-ink-300 hover:bg-cream-50"
                >
                  <Icon className="h-5 w-5 text-ink-700" />
                  <span className="text-sm font-medium text-ink">{b.label}</span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirmation */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert changes?</DialogTitle>
            <DialogDescription>
              This restores the page to the last saved version. Unsaved edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetToLoaded}>
              <RotateCcw className="h-4 w-4" />
              Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}