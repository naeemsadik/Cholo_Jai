"use client";

export function SettingsView() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Settings</div>
          <h1 className="t-huge tracking-tighter">
            <span className="font-serif italic text-accent">Parameters.</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 border border-ink bg-bone p-6 space-y-5">
          <div className="eyebrow !text-accent">Platform</div>
          <Field label="Site name"><input className="input-brut" defaultValue="Cholo Jai" /></Field>
          <Field label="Tagline"><input className="input-brut" defaultValue="Find events worth going to" /></Field>
          <Field label="Initial city"><input className="input-brut" defaultValue="Dhaka" /></Field>
          <Field label="Outbound button labels" hint="One per line">
            <textarea className="input-brut min-h-[140px]" defaultValue={`Register\nGet Tickets\nLearn More\nContact Organizer\nView Official Page`} />
          </Field>
          <button className="btn-accent">✓ Save platform settings</button>
        </div>

        <div className="col-span-12 md:col-span-6 border border-ink bg-bone p-6 space-y-5">
          <div className="eyebrow !text-accent">Integrations</div>
          <Field label="API base URL"><input className="input-brut" placeholder="https://api.cholojai.bd" /></Field>
          <Field label="Analytics provider" hint="Plausible · GA4 · PostHog">
            <select className="input-brut">
              <option>Plausible</option>
              <option>GA4</option>
              <option>PostHog</option>
            </select>
          </Field>
          <Field label="Image storage"><input className="input-brut" defaultValue="Cloudinary (configured)" /></Field>
          <div className="border border-accent bg-paper p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">⚠ Keys</div>
            <p className="text-sm text-ink/80 leading-relaxed">
              API keys and secrets are configured per-environment — not stored here. Pull from your secret manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="label-brut">{label}</label>
        {hint && <span className="text-[11px] text-ink/60">— {hint}</span>}
      </div>
      {children}
    </div>
  );
}