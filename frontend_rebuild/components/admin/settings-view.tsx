"use client";

import * as React from "react";
import {
  Save,
  Loader2,
  KeyRound,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  CircleDot,
  Code2,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  adminGetSettings,
  adminUpdateSettings,
  adminExportAnalytics,
  adminResetAnalytics,
} from "@/lib/api";
import { OUTBOUND_BUTTON_LABELS } from "@/lib/categories";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import type {
  AdminSettings,
  MetaTag,
  OutboundButtonLabel,
  PixelCode,
  PixelProvider,
} from "@/lib/types";
import { DEFAULT_PLACEMENT, PROVIDER_HINT, PROVIDER_LABEL, renderPixel, formatDescriptorsForPreview } from "@/lib/pixel-snippets";

type SaveState = "saved" | "saving" | "dirty" | "error";

const AUTOSAVE_DELAY_MS = 1500;

const PROVIDERS: PixelProvider[] = [
  "facebook",
  "google_analytics",
  "tiktok",
  "custom",
];

function newPixel(): PixelCode {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    provider: "facebook",
    pixel_id: "",
    placement: DEFAULT_PLACEMENT.facebook,
    enabled: false,
    notes: "",
    created_at: new Date().toISOString(),
  };
}

function newMeta(): MetaTag {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    content: "",
    enabled: true,
    created_at: new Date().toISOString(),
  };
}

function relativeTime(iso?: string): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function SettingsView() {
  const [draft, setDraft] = React.useState<AdminSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveState, setSaveState] = React.useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // ── Initial load ─────────────────────────────────────────────────────
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminGetSettings();
      if (!mounted) return;
      if (res.data) {
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at ?? null);
      } else {
        setLoadError(res.error ?? "Could not load settings.");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Auto-save — debounce 1.5s after last edit ────────────────────────
  React.useEffect(() => {
    if (saveState !== "dirty" || !draft) return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      const res = await adminUpdateSettings(draft);
      if (res.data) {
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at ?? null);
        setSaveState("saved");
      } else {
        setSaveState("error");
        toast({
          title: "Could not save settings",
          description: res.error ?? "Please retry.",
          variant: "destructive",
        });
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [saveState, draft]);

  // Generic field patch — marks dirty so the auto-save timer kicks off.
  function patch<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaveState("dirty");
  }

  // ── Pixel array ops ──────────────────────────────────────────────────
  function addPixel() {
    if (!draft) return;
    patch("pixels", [...draft.pixels, newPixel()]);
  }
  function updatePixel(id: string, patchObj: Partial<PixelCode>) {
    if (!draft) return;
    patch(
      "pixels",
      draft.pixels.map((p) => (p.id === id ? { ...p, ...patchObj } : p)),
    );
  }
  function removePixel(id: string) {
    if (!draft) return;
    patch("pixels", draft.pixels.filter((p) => p.id !== id));
  }

  // ── Meta array ops ───────────────────────────────────────────────────
  function addMeta() {
    if (!draft) return;
    patch("meta_tags", [...draft.meta_tags, newMeta()]);
  }
  function updateMeta(id: string, patchObj: Partial<MetaTag>) {
    if (!draft) return;
    patch(
      "meta_tags",
      draft.meta_tags.map((m) => (m.id === id ? { ...m, ...patchObj } : m)),
    );
  }
  function removeMeta(id: string) {
    if (!draft) return;
    patch("meta_tags", draft.meta_tags.filter((m) => m.id !== id));
  }

  function toggleLabel(label: OutboundButtonLabel) {
    if (!draft) return;
    const next = draft.outbound_labels.includes(label)
      ? draft.outbound_labels.filter((l) => l !== label)
      : [...draft.outbound_labels, label];
    patch("outbound_labels", next);
  }

  async function manualSave() {
    if (!draft || saveState === "saving") return;
    setSaveState("saving");
    const res = await adminUpdateSettings(draft);
    if (res.data) {
      setDraft(res.data);
      setLastSavedAt(res.data.updated_at ?? null);
      setSaveState("saved");
      toast({
        title: "Settings saved",
        description: "Pixels & meta tags are now live on every public page.",
        variant: "success",
      });
    } else {
      setSaveState("error");
      toast({
        title: "Could not save settings",
        description: res.error ?? "Please retry.",
        variant: "destructive",
      });
    }
  }

  async function onExport() {
    setExporting(true);
    const res = await adminExportAnalytics();
    setExporting(false);
    if (res.source === "live" || res.source === "fallback") {
      const blob = new Blob([res.data], { type: "application/x-ndjson" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghurighuri-analytics-${new Date().toISOString().slice(0, 10)}.ndjson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Analytics downloaded", description: "NDJSON file saved." });
    } else {
      toast({
        title: "Export unavailable",
        description: res.error ?? "Try again later.",
        variant: "destructive",
      });
    }
  }

  async function onResetAnalytics() {
    setResetting(true);
    const res = await adminResetAnalytics();
    setResetting(false);
    setConfirmReset(false);
    if (res.source === "live" || res.source === "fallback") {
      toast({
        title: "Analytics reset",
        description: "All recorded events have been cleared.",
      });
    } else {
      toast({
        title: "Could not reset",
        description: res.error ?? "Try again later.",
        variant: "destructive",
      });
    }
  }

  if (loading || !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadError ? `Settings: ${loadError}` : "Loading settings…"}
      </div>
    );
  }

  return (
    <>
      <AdminSectionHeader
        eyebrow="Settings"
        title="Platform configuration"
        description="Editorial identity, outbound defaults, tracking pixels, and custom meta tags. Changes auto-save and apply to every public page on the next render."
        actions={<SaveIndicator state={saveState} lastSavedAt={lastSavedAt} onManualSave={manualSave} />}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-12 md:gap-8">
        {/* Left — main settings */}
        <div className="md:col-span-8 space-y-6">
          {/* Identity */}
          <Card className="p-6">
            <span className="eyebrow">Identity</span>
            <h2 className="mt-2 font-display text-xl tracking-tight">Editorial</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <Label className="mb-1.5 inline-block">Site name</Label>
                <Input
                  value={draft.site_name}
                  onChange={(e) => patch("site_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 inline-block">Default city</Label>
                <Input
                  value={draft.default_city}
                  onChange={(e) => patch("default_city", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-1.5 inline-block">Tagline</Label>
                <Textarea
                  rows={2}
                  value={draft.tagline}
                  onChange={(e) => patch("tagline", e.target.value)}
                />
                <p className="mt-1 text-xs text-ink-500">
                  Used in the homepage hero and email footer.
                </p>
              </div>
            </div>
          </Card>

          {/* Outbound */}
          <Card className="p-6">
            <span className="eyebrow">Outbound</span>
            <h2 className="mt-2 font-display text-xl tracking-tight">Default button</h2>
            <p className="mt-1 text-sm text-ink-500">
              The default label shown on the primary CTA when an organizer does not specify one.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <Label className="mb-1.5 inline-block">Default label</Label>
                <Select
                  value={draft.default_outbound_label}
                  onValueChange={(v) =>
                    patch("default_outbound_label", v as OutboundButtonLabel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTBOUND_BUTTON_LABELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <span className="eyebrow">Available labels</span>
            <p className="mt-1 text-sm text-ink-500">
              Pick which labels editors can choose from when adding events. Toggling a label off does not
              affect events already published.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {OUTBOUND_BUTTON_LABELS.map((label) => {
                const active = draft.outbound_labels.includes(label.value as never);
                return (
                  <button
                    key={label.value}
                    type="button"
                    onClick={() => toggleLabel(label.value as never)}
                    className={
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all " +
                      (active
                        ? "border-ink bg-ink text-paper"
                        : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink")
                    }
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Tracking pixels */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="eyebrow">Tracking pixels</span>
                <h2 className="mt-2 font-display text-xl tracking-tight">
                  Inject analytics scripts into public pages
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Pixels render server-side into the public site's{" "}
                  <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem]">
                    &lt;head&gt;
                  </code>{" "}
                  or{" "}
                  <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem]">
                    &lt;body&gt;
                  </code>{" "}
                  on every request. Facebook Pixel uses body-bottom by Facebook's recommendation.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={addPixel}>
                <Plus className="h-4 w-4" />
                Add pixel
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {draft.pixels.length === 0 ? (
                <div className="rounded-md border border-dashed border-rule bg-cream-50 px-5 py-8 text-center">
                  <Code2 className="mx-auto h-5 w-5 text-ink-400" />
                  <p className="mt-2 text-sm font-medium text-ink">No pixels yet.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Add Facebook Pixel, Google Analytics 4, TikTok Pixel, or a custom snippet.
                  </p>
                </div>
              ) : (
                draft.pixels.map((p) => (
                  <PixelRow
                    key={p.id}
                    pixel={p}
                    onChange={(obj) => updatePixel(p.id, obj)}
                    onRemove={() => removePixel(p.id)}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Custom meta tags */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="eyebrow">Custom meta tags</span>
                <h2 className="mt-2 font-display text-xl tracking-tight">
                  Add &lt;meta&gt; tags to every public page
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Anything the structured metadata export can't express:{" "}
                  <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem]">
                    google-site-verification
                  </code>
                  ,{" "}
                  <code className="rounded bg-cream-200 px-1 font-mono text-[0.65rem]">
                    theme-color
                  </code>
                  , custom robots, etc. Applies to all public routes.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={addMeta}>
                <Plus className="h-4 w-4" />
                Add tag
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {draft.meta_tags.length === 0 ? (
                <div className="rounded-md border border-dashed border-rule bg-cream-50 px-5 py-8 text-center">
                  <Tag className="mx-auto h-5 w-5 text-ink-400" />
                  <p className="mt-2 text-sm font-medium text-ink">No custom meta tags.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Click <span className="font-medium text-ink">Add tag</span> to insert one.
                  </p>
                </div>
              ) : (
                draft.meta_tags.map((m) => (
                  <MetaRow
                    key={m.id}
                    tag={m}
                    onChange={(obj) => updateMeta(m.id, obj)}
                    onRemove={() => removeMeta(m.id)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right — status / data */}
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
              <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} onManualSave={manualSave} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-ink-700" />
              <span className="eyebrow">Export data</span>
            </div>
            <h3 className="mt-2 font-display text-lg leading-tight tracking-tight">
              Download analytics
            </h3>
            <p className="mt-2 text-xs text-ink-500 leading-relaxed">
              Save a copy of every recorded pageview, outbound click, and form completion as an NDJSON file.
              Open it in any editor or pipe it into your own analysis.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={onExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? "Preparing…" : "Download .ndjson"}
            </Button>
          </Card>

          <Card className="p-5 border-ember-100 bg-ember-50">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-ember-700" />
              <span className="eyebrow text-ember-700">Secrets</span>
            </div>
            <p className="mt-2 text-xs text-ember-700 leading-relaxed">
              API keys and tokens are configured per-environment — never stored in this form. Update them via
              the platform&rsquo;s secret manager.
            </p>
          </Card>

          <Card className="p-5 border-ember-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-ember" />
              <span className="eyebrow text-ember">Danger zone</span>
            </div>
            <p className="mt-2 text-xs text-ink-700 leading-relaxed">
              Permanently clears every recorded analytics event. Use this before handing the project to a
              new admin or resetting after a test burst.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setConfirmReset(true)}
            >
              <AlertTriangle className="h-4 w-4" />
              Reset analytics
            </Button>
          </Card>
        </aside>
      </div>

      {/* Reset confirmation */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset analytics?</DialogTitle>
            <DialogDescription>
              This permanently clears every recorded pageview, outbound click, and form completion from
              <code className="mx-1 rounded bg-cream-200 px-1 py-0.5 font-mono text-[0.65rem]">data/analytics.ndjson</code>.
              The dashboard will reset to zero. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onResetAnalytics}
              disabled={resetting}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {resetting ? "Resetting…" : "Reset everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SaveIndicator({
  state,
  lastSavedAt,
  onManualSave,
}: {
  state: SaveState;
  lastSavedAt: string | null;
  onManualSave: () => void;
}) {
  let icon: React.ReactNode = null;
  let label: React.ReactNode = "";
  let tone = "text-ink-500";
  let bg = "";
  switch (state) {
    case "saved":
      icon = <Check className="h-3.5 w-3.5 text-accent-700" />;
      label = lastSavedAt
        ? <>Saved <span className="font-mono text-ink-500">{relativeTime(lastSavedAt)}</span></>
        : "Saved";
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

function PixelRow({
  pixel,
  onChange,
  onRemove,
}: {
  pixel: PixelCode;
  onChange: (patch: Partial<PixelCode>) => void;
  onRemove: () => void;
}) {
  const [showPreview, setShowPreview] = React.useState(false);
  const preview = formatDescriptorsForPreview(
    renderPixel({ ...pixel, enabled: true }),
  );

  return (
    <div className="rounded-md border border-rule bg-paper p-4">
      <div className="grid items-end gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <Label className="mb-1.5 inline-block">Provider</Label>
          <Select
            value={pixel.provider}
            onValueChange={(v) => {
              const provider = v as PixelProvider;
              onChange({
                provider,
                placement: DEFAULT_PLACEMENT[provider],
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVIDER_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4">
          <Label className="mb-1.5 inline-block">
            {pixel.provider === "custom" ? "Snippet" : "ID"}
          </Label>
          <Input
            value={pixel.pixel_id}
            onChange={(e) => onChange({ pixel_id: e.target.value })}
            placeholder={
              pixel.provider === "facebook"
                ? "123456789012345"
                : pixel.provider === "google_analytics"
                  ? "G-XXXXXXXX"
                  : pixel.provider === "tiktok"
                    ? "C123ABC456"
                    : '<script>...</script>'
            }
            className="font-mono text-xs"
          />
          <p className="mt-1 text-[0.65rem] text-ink-500">
            {PROVIDER_HINT[pixel.provider]}
          </p>
        </div>
        <div className="md:col-span-2">
          <Label className="mb-1.5 inline-block">Placement</Label>
          <Select
            value={pixel.placement}
            onValueChange={(v) => onChange({ placement: v as "head" | "body" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="head">head</SelectItem>
              <SelectItem value="body">body</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <Checkbox
            id={`px-enabled-${pixel.id}`}
            checked={pixel.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          <Label htmlFor={`px-enabled-${pixel.id}`} className="text-sm">
            Active
          </Label>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove pixel"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="inline-flex items-center gap-1 text-ink-500 hover:text-ink"
        >
          <Code2 className="h-3 w-3" />
          {showPreview ? "Hide preview" : "Preview generated snippet"}
        </button>
        {pixel.notes !== undefined && pixel.notes.length > 0 && (
          <Badge variant="muted" className="font-mono text-[0.65rem]">
            note
          </Badge>
        )}
      </div>

      {showPreview && (
        <pre className="mt-3 max-h-40 overflow-auto rounded bg-cream-100 px-3 py-2 text-[0.65rem] leading-relaxed text-ink-700">
          {preview || "(no output — fill in the ID and enable)"}
        </pre>
      )}
    </div>
  );
}

function MetaRow({
  tag,
  onChange,
  onRemove,
}: {
  tag: MetaTag;
  onChange: (patch: Partial<MetaTag>) => void;
  onRemove: () => void;
}) {
  const nameWarn = tag.name.trim().length > 0 && /\s/.test(tag.name.trim());
  const reservedWarn =
    tag.name.trim().startsWith("og:") ||
    tag.name.trim().startsWith("twitter:");

  return (
    <div className="rounded-md border border-rule bg-paper p-4">
      <div className="grid items-end gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <Label className="mb-1.5 inline-block">Name</Label>
          <Input
            value={tag.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="google-site-verification"
            className="font-mono text-xs"
          />
        </div>
        <div className="md:col-span-6">
          <Label className="mb-1.5 inline-block">Content</Label>
          <Input
            value={tag.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="abc123XYZ"
            className="font-mono text-xs"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <Checkbox
            id={`mt-enabled-${tag.id}`}
            checked={tag.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
          />
          <Label htmlFor={`mt-enabled-${tag.id}`} className="text-sm">
            Active
          </Label>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove meta tag"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {(nameWarn || reservedWarn) && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-ember-700">
          <AlertTriangle className="h-3 w-3" />
          {nameWarn
            ? "Meta tag names shouldn't contain spaces."
            : "Names starting with og: or twitter: are reserved — use the structured metadata export instead."}
        </p>
      )}
    </div>
  );
}