"use client";

import * as React from "react";
import {
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings2,
  Plus,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Check,
  CircleDot,
  GripVertical,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import {
  adminGetHomeConfig,
  adminUpdateHomeConfig,
  type HomePageConfigResponse,
} from "@/lib/api";

type SaveState = "saved" | "saving" | "dirty" | "error";
const AUTOSAVE_DELAY_MS = 1500;

// Display metadata per section id — the canonical section list lives in
// `lib/cms-store.ts`, this is just UX labeling for the admin UI.
interface SectionMeta {
  id: string;
  title: string;
  blurb: string;
  hasConfig: boolean;
}

const SECTION_META: SectionMeta[] = [
  { id: "hero", title: "Hero carousel", blurb: "Auto-rotating promo slides at the very top.", hasConfig: true },
  { id: "marquee", title: "Marquee strip", blurb: "Soft brand band carrying your tagline.", hasConfig: true },
  { id: "mobile_happening_today", title: "Happening soon (mobile)", blurb: "Mobile-first horizontal carousel of next events.", hasConfig: true },
  { id: "weekend_forecast", title: "Weekend forecast", blurb: "Friday–Sunday picks with quick filters.", hasConfig: true },
  { id: "featured_lead", title: "Featured lead", blurb: "Editor's pick — large editorial card.", hasConfig: true },
  { id: "sector_explorer", title: "Sector explorer", blurb: "Neighborhood tiles grid.", hasConfig: true },
  { id: "category_explorer", title: "Category explorer", blurb: "Categories grid, parallel to sectors.", hasConfig: true },
  { id: "calendar", title: "Calendar view", blurb: "Month-by-month date picker.", hasConfig: true },
  { id: "upcoming_grid", title: "Upcoming grid", blurb: "Sortable list of all upcoming events.", hasConfig: true },
  { id: "organizer_cta", title: "Organizer CTA", blurb: "Friendly invite to submit events.", hasConfig: true },
  { id: "newsletter", title: "Newsletter CTA", blurb: "Email signup callout.", hasConfig: true },
];

function metaFor(id: string): SectionMeta {
  return (
    SECTION_META.find((m) => m.id === id) ?? {
      id,
      title: id,
      blurb: "Custom section.",
      hasConfig: true,
    }
  );
}

// ── SaveIndicator (small inline) ─────────────────────────────────────
function SaveIndicator({
  state,
  lastSavedAt,
  onManualSave,
}: {
  state: SaveState;
  lastSavedAt: string | null;
  onManualSave: () => void;
}) {
  const relative = (iso: string | null) => {
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
          <span className="font-mono text-ink-500">{relative(lastSavedAt)}</span>
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

// ── Per-section config editors ───────────────────────────────────────
function SectionConfigEditor({
  id,
  value,
  onChange,
}: {
  id: string;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  if (id === "hero") {
    const v = (value ?? { id: "hero", enabled: true, maxItems: 5 }) as {
      maxItems: number;
    };
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 inline-block">Max items in carousel</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={Number.isFinite(v.maxItems) ? v.maxItems : 5}
            onChange={(e) =>
              onChange({ id: "hero", enabled: true, maxItems: Number(e.target.value) || 5 })
            }
          />
          <p className="mt-1 text-xs text-ink-500">1 to 10. Default: 5.</p>
        </div>
      </div>
    );
  }

  if (id === "marquee") {
    const v = (value ?? { id: "marquee", enabled: true, items: [] }) as {
      items: { en: string; bn?: string }[];
    };
    const items = Array.isArray(v.items) ? v.items : [];
    function patchItems(next: { en: string; bn?: string }[]) {
      onChange({ id: "marquee", enabled: true, items: next });
    }
    function addItem() {
      patchItems([...items, { en: "" }]);
    }
    function removeItem(idx: number) {
      patchItems(items.filter((_, i) => i !== idx));
    }
    function updateItem(idx: number, patchObj: Partial<{ en: string; bn?: string }>) {
      patchItems(items.map((it, i) => (i === idx ? { ...it, ...patchObj } : it)));
    }
    return (
      <div className="space-y-3">
        <p className="text-xs text-ink-500">
          Short phrases that loop across the marquee. Bangla versions are optional but help your bilingual audience.
        </p>
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-rule bg-cream-50 px-4 py-6 text-center text-xs text-ink-500">
            No items yet — add one to fill the strip.
          </div>
        )}
        {items.map((it, idx) => (
          <div key={idx} className="grid gap-2 rounded-md border border-rule bg-paper p-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <Label className="mb-1 inline-block text-xs">English</Label>
              <Input
                value={it.en}
                onChange={(e) => updateItem(idx, { en: e.target.value })}
                placeholder="Discover. Explore. Experience."
              />
            </div>
            <div className="md:col-span-6">
              <Label className="mb-1 inline-block text-xs">Bangla</Label>
              <Input
                value={it.bn ?? ""}
                onChange={(e) => updateItem(idx, { bn: e.target.value })}
                placeholder="আবিষ্কার করো। ঘুরে দেখো। উপভোগ করো।"
              />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                aria-label={`Remove item ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add phrase
        </Button>
      </div>
    );
  }

  if (id === "mobile_happening_today") {
    const v = (value ?? { id: "mobile_happening_today", enabled: true, maxItems: 6 }) as {
      maxItems: number;
    };
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 inline-block">Max items shown</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={Number.isFinite(v.maxItems) ? v.maxItems : 6}
            onChange={(e) =>
              onChange({
                id: "mobile_happening_today",
                enabled: true,
                maxItems: Number(e.target.value) || 6,
              })
            }
          />
          <p className="mt-1 text-xs text-ink-500">Mobile cards on the "happening soon" carousel.</p>
        </div>
      </div>
    );
  }

  if (id === "weekend_forecast") {
    const v = (value ?? { id: "weekend_forecast", enabled: true, windowDays: 7 }) as {
      windowDays: 7 | 14;
    };
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 inline-block">Forecast window</Label>
          <Select
            value={String(v.windowDays ?? 7)}
            onValueChange={(val) =>
              onChange({
                id: "weekend_forecast",
                enabled: true,
                windowDays: (val === "14" ? 14 : 7) as 7 | 14,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Next 7 days</SelectItem>
              <SelectItem value="14">Next 14 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-ink-500">Wider window = more events to choose from.</p>
        </div>
      </div>
    );
  }

  if (id === "featured_lead") {
    const v = (value ?? { id: "featured_lead", enabled: true }) as {
      eyebrow?: { en: string; bn?: string };
      heading?: { en: string; bn?: string };
    };
    function patch(patchObj: Partial<{ eyebrow: { en: string; bn?: string }; heading: { en: string; bn?: string } }>) {
      onChange({ id: "featured_lead", enabled: true, ...v, ...patchObj });
    }
    return (
      <div className="space-y-4">
        <p className="text-xs text-ink-500">
          Optional eyebrow and heading above the large editor's pick.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="mb-1 inline-block text-xs">Eyebrow · English</Label>
            <Input
              value={v.eyebrow?.en ?? ""}
              onChange={(e) => patch({ eyebrow: { en: e.target.value, bn: v.eyebrow?.bn } })}
            />
          </div>
          <div>
            <Label className="mb-1 inline-block text-xs">Eyebrow · Bangla</Label>
            <Input
              value={v.eyebrow?.bn ?? ""}
              onChange={(e) => patch({ eyebrow: { en: v.eyebrow?.en ?? "", bn: e.target.value } })}
            />
          </div>
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · English</Label>
            <Input
              value={v.heading?.en ?? ""}
              onChange={(e) => patch({ heading: { en: e.target.value, bn: v.heading?.bn } })}
            />
          </div>
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · Bangla</Label>
            <Input
              value={v.heading?.bn ?? ""}
              onChange={(e) => patch({ heading: { en: v.heading?.en ?? "", bn: e.target.value } })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (id === "sector_explorer" || id === "category_explorer") {
    const v = (value ?? { id, enabled: true, showCounts: true }) as {
      showCounts: boolean;
    };
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={Boolean(v.showCounts)}
          onCheckedChange={(next) => onChange({ id, enabled: true, showCounts: next })}
          label="Show event counts"
        />
        <span className="text-sm text-ink-700">Show event counts next to each tile</span>
      </div>
    );
  }

  if (id === "calendar") {
    const v = (value ?? { id: "calendar", enabled: true, showEmptyMonths: false }) as {
      showEmptyMonths: boolean;
    };
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={Boolean(v.showEmptyMonths)}
          onCheckedChange={(next) =>
            onChange({ id: "calendar", enabled: true, showEmptyMonths: next })
          }
          label="Show months with no events"
        />
        <span className="text-sm text-ink-700">Show months with no events (calendar always rendered if section enabled)</span>
      </div>
    );
  }

  if (id === "upcoming_grid") {
    const v = (value ?? {
      id: "upcoming_grid",
      enabled: true,
      defaultView: "grid",
      pageSize: 12,
    }) as { defaultView: "grid" | "list"; pageSize: number };
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 inline-block">Default view</Label>
          <Select
            value={v.defaultView}
            onValueChange={(val) =>
              onChange({
                id: "upcoming_grid",
                enabled: true,
                defaultView: (val === "list" ? "list" : "grid") as "grid" | "list",
                pageSize: v.pageSize,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 inline-block">Page size</Label>
          <Input
            type="number"
            min={6}
            max={48}
            value={Number.isFinite(v.pageSize) ? v.pageSize : 12}
            onChange={(e) =>
              onChange({
                id: "upcoming_grid",
                enabled: true,
                defaultView: v.defaultView,
                pageSize: Number(e.target.value) || 12,
              })
            }
          />
          <p className="mt-1 text-xs text-ink-500">Events per page on the upcoming grid.</p>
        </div>
      </div>
    );
  }

  if (id === "organizer_cta") {
    const v = (value ?? { id: "organizer_cta", enabled: true }) as {
      heading?: { en: string; bn?: string };
      body?: { en: string; bn?: string };
    };
    function patch(patchObj: Partial<{ heading: { en: string; bn?: string }; body: { en: string; bn?: string } }>) {
      onChange({ id: "organizer_cta", enabled: true, ...v, ...patchObj });
    }
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · English</Label>
            <Input
              value={v.heading?.en ?? ""}
              onChange={(e) => patch({ heading: { en: e.target.value, bn: v.heading?.bn } })}
            />
          </div>
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · Bangla</Label>
            <Input
              value={v.heading?.bn ?? ""}
              onChange={(e) => patch({ heading: { en: v.heading?.en ?? "", bn: e.target.value } })}
            />
          </div>
        </div>
        <div>
          <Label className="mb-1 inline-block text-xs">Body · English</Label>
          <Textarea
            rows={3}
            value={v.body?.en ?? ""}
            onChange={(e) => patch({ body: { en: e.target.value, bn: v.body?.bn } })}
          />
        </div>
        <div>
          <Label className="mb-1 inline-block text-xs">Body · Bangla</Label>
          <Textarea
            rows={3}
            value={v.body?.bn ?? ""}
            onChange={(e) => patch({ body: { en: v.body?.en ?? "", bn: e.target.value } })}
          />
        </div>
      </div>
    );
  }

  if (id === "newsletter") {
    const v = (value ?? { id: "newsletter", enabled: true }) as {
      heading?: { en: string; bn?: string };
      body?: { en: string; bn?: string };
    };
    function patch(patchObj: Partial<{ heading: { en: string; bn?: string }; body: { en: string; bn?: string } }>) {
      onChange({ id: "newsletter", enabled: true, ...v, ...patchObj });
    }
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · English</Label>
            <Input
              value={v.heading?.en ?? ""}
              onChange={(e) => patch({ heading: { en: e.target.value, bn: v.heading?.bn } })}
            />
          </div>
          <div>
            <Label className="mb-1 inline-block text-xs">Heading · Bangla</Label>
            <Input
              value={v.heading?.bn ?? ""}
              onChange={(e) => patch({ heading: { en: v.heading?.en ?? "", bn: e.target.value } })}
            />
          </div>
        </div>
        <div>
          <Label className="mb-1 inline-block text-xs">Body · English</Label>
          <Textarea
            rows={3}
            value={v.body?.en ?? ""}
            onChange={(e) => patch({ body: { en: e.target.value, bn: v.body?.bn } })}
          />
        </div>
        <div>
          <Label className="mb-1 inline-block text-xs">Body · Bangla</Label>
          <Textarea
            rows={3}
            value={v.body?.bn ?? ""}
            onChange={(e) => patch({ body: { en: v.body?.en ?? "", bn: e.target.value } })}
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs text-ink-500">No settings for this section.</p>
  );
}

// ── Main view ────────────────────────────────────────────────────────

export function HomeControlsView() {
  const [draft, setDraft] = React.useState<HomePageConfigResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [configId, setConfigId] = React.useState<string | null>(null);

  // Drag state — track which item is being dragged.
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = React.useState(false);

  // ── Load ──
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminGetHomeConfig();
      if (!mounted) return;
      if (res.data && Array.isArray(res.data.order)) {
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at ?? null);
      } else {
        setLoadError(res.error ?? "Could not load home config.");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Auto-save ──
  React.useEffect(() => {
    if (saveState !== "dirty" || !draft) return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      const res = await adminUpdateHomeConfig(draft);
      if (res.data) {
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at ?? null);
        setSaveState("saved");
      } else {
        setSaveState("error");
        toast({
          title: "Could not save home config",
          description: res.error ?? "Please retry.",
          variant: "destructive",
        });
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [saveState, draft]);

  // ── Mutators ──
  function markDirty(next: HomePageConfigResponse) {
    setDraft(next);
    setSaveState("dirty");
  }

  function moveSection(id: string, dir: -1 | 1) {
    if (!draft) return;
    const order = [...draft.order];
    const idx = order.indexOf(id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    const [removed] = order.splice(idx, 1);
    order.splice(target, 0, removed);
    markDirty({ ...draft, order });
  }

  function toggleEnabled(id: string) {
    if (!draft) return;
    const sec = (draft.sections[id] ?? { id, enabled: false }) as { enabled?: boolean };
    markDirty({
      ...draft,
      sections: {
        ...draft.sections,
        [id]: { ...sec, id, enabled: !(sec.enabled ?? false) },
      },
    });
  }

  function setSectionConfig(id: string, value: unknown) {
    if (!draft) return;
    markDirty({
      ...draft,
      sections: {
        ...draft.sections,
        [id]: value,
      },
    });
  }

  // ── Drag reorder ──
  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      // ignore
    }
  }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverId) setDragOverId(id);
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
    setDragId(null);
    setDragOverId(null);
    if (!draft || !sourceId || sourceId === targetId) return;
    const order = [...draft.order];
    const from = order.indexOf(sourceId);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [removed] = order.splice(from, 1);
    order.splice(to, 0, removed);
    markDirty({ ...draft, order });
  }
  function onDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  async function manualSave() {
    if (!draft || saveState === "saving") return;
    setSaveState("saving");
    const res = await adminUpdateHomeConfig(draft);
    if (res.data) {
      setDraft(res.data);
      setLastSavedAt(res.data.updated_at ?? null);
      setSaveState("saved");
      toast({
        title: "Home page config saved",
        description: "Public homepage reflects these changes on the next render.",
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

  function resetToDefault() {
    // Reconstruct a sensible default — pull a fresh copy via the API by sending
    // empty order triggers server defaults; simpler to just clear locally and
    // rely on server mergeHome fallback by sending `{}`.
    setResetConfirm(false);
    (async () => {
      // We don't have a "reset" endpoint; easiest is to delete config locally
      // and ask the server to repopulate by sending a minimal order.
      // Sending the canonical order but blank sections forces a defaults merge.
      const minimalOrder = SECTION_META.map((s) => s.id);
      const empty = {
        order: minimalOrder,
        sections: {} as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      };
      setSaveState("saving");
      const res = await adminUpdateHomeConfig(empty);
      if (res.data) {
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at ?? null);
        setSaveState("saved");
        toast({
          title: "Reset to defaults",
          description: "Home page config restored to its starting state.",
        });
      } else {
        setSaveState("error");
        toast({
          title: "Could not reset",
          description: res.error ?? "Please retry.",
          variant: "destructive",
        });
      }
    })();
  }

  if (loading || !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadError ? `Home page config: ${loadError}` : "Loading home page config…"}
      </div>
    );
  }

  return (
    <>
      <AdminSectionHeader
        eyebrow="Home page"
        title="Section controls"
        description="Reorder, toggle, and tune every section of the public homepage. Changes auto-save and apply on the next render."
        actions={
          <div className="flex items-center gap-2">
            <SaveIndicator
              state={saveState}
              lastSavedAt={lastSavedAt}
              onManualSave={manualSave}
            />
            <Button variant="outline" size="sm" onClick={() => setResetConfirm(true)}>
              <RotateCcw className="h-4 w-4" />
              Reset to default
            </Button>
          </div>
        }
      />

      <div className="mt-10 grid gap-6 md:grid-cols-12 md:gap-8">
        {/* Left — section list */}
        <div className="md:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-rule bg-cream-50 px-5 py-3">
              <span className="eyebrow">Sections</span>
              <p className="mt-1 text-xs text-ink-500">
                Drag to reorder, or use the arrow buttons. {draft.order.length} sections total.
              </p>
            </div>
            <ul className="divide-y divide-rule">
              {draft.order.map((id, idx) => {
                const meta = metaFor(id);
                const sec = (draft.sections[id] ?? { id, enabled: true }) as {
                  enabled?: boolean;
                };
                const enabled = sec.enabled ?? true;
                const dragging = dragId === id;
                const dragOver = dragOverId === id && dragId !== id;
                const isFirst = idx === 0;
                const isLast = idx === draft.order.length - 1;
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={(e) => onDragStart(e, id)}
                    onDragOver={(e) => onDragOver(e, id)}
                    onDrop={(e) => onDrop(e, id)}
                    onDragEnd={onDragEnd}
                    className={`group flex items-start gap-3 px-5 py-4 transition-colors ${
                      dragging ? "opacity-50" : ""
                    } ${dragOver ? "bg-ember-50" : "bg-paper hover:bg-cream-50"}`}
                  >
                    {/* Drag handle */}
                    <button
                      type="button"
                      aria-label={`Drag ${meta.title}`}
                      className="mt-0.5 cursor-grab touch-none text-ink-400 hover:text-ink active:cursor-grabbing"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>

                    {/* Position + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-400">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-base font-medium text-ink">
                          {meta.title}
                        </h3>
                        {!enabled && (
                          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">{meta.blurb}</p>

                      {/* Toggle + actions row */}
                      <div className="mt-3 flex items-center gap-2">
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleEnabled(id)}
                          label={`Toggle ${meta.title}`}
                        />
                        <span className="text-xs text-ink-500">
                          {enabled ? "Visible on site" : "Hidden from site"}
                        </span>
                      </div>
                    </div>

                    {/* Right-side controls */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(id, -1)}
                        disabled={isFirst}
                        aria-label={`Move ${meta.title} up`}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(id, 1)}
                        disabled={isLast}
                        aria-label={`Move ${meta.title} down`}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      {meta.hasConfig && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfigId(id)}
                          aria-label={`Configure ${meta.title}`}
                          title="Configure"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Right — status / preview info */}
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
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-ink-700" />
              <span className="eyebrow">What's visible</span>
            </div>
            <h3 className="mt-2 font-display text-lg leading-tight tracking-tight">
              Section summary
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              {draft.order.map((id, idx) => {
                const meta = metaFor(id);
                const sec = (draft.sections[id] ?? { enabled: true }) as {
                  enabled?: boolean;
                };
                const enabled = sec.enabled ?? true;
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span className="font-mono text-[0.6rem] text-ink-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {enabled ? (
                      <Eye className="h-3 w-3 text-accent-700" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-ink-400" />
                    )}
                    <span
                      className={
                        enabled
                          ? "text-ink-700"
                          : "text-ink-400 line-through decoration-ink-300"
                      }
                    >
                      {meta.title}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Separator className="my-4" />
            <p className="text-xs text-ink-500">
              Hidden sections are skipped entirely during render — they don't reserve space.
            </p>
          </Card>

          <Card className="p-5 border-ember-100 bg-ember-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-ember-700" />
              <span className="eyebrow text-ember-700">Tip</span>
            </div>
            <p className="mt-2 text-xs text-ember-700 leading-relaxed">
              Pages are cached for ~5 minutes. Allow up to one cycle after saving for changes to be visible to anonymous visitors.
            </p>
          </Card>
        </aside>
      </div>

      {/* ── Per-section config sheet ── */}
      <Dialog open={Boolean(configId)} onOpenChange={(o) => !o && setConfigId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {configId ? metaFor(configId).title : "Section settings"}
            </DialogTitle>
            <DialogDescription>
              Per-section options. Bangla fields are optional but populate the localized version when readers switch languages.
            </DialogDescription>
          </DialogHeader>
          {configId && (
            <div className="mt-2">
              <SectionConfigEditor
                id={configId}
                value={draft.sections[configId]}
                onChange={(next) => setSectionConfig(configId, next)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigId(null)}>
              <X className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirmation */}
      <Dialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset home page config?</DialogTitle>
            <DialogDescription>
              This wipes any per-section overrides you have set and restores the canonical section order with default settings. Custom copy you've entered (e.g. marquee phrases, organizer CTA body) is also cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetToDefault}>
              <RotateCcw className="h-4 w-4" />
              Reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
