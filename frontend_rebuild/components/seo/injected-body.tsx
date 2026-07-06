// <InjectedBody /> — server-renders body-bottom pixels (Facebook Pixel standard
// placement, etc.) AFTER children, so fbq('init', ...) and fbq('track',
// 'PageView') fire after the page DOM is ready.
//
// Reads from lib/settings-store.ts. Renders via dangerouslySetInnerHTML —
// admin-only data, server-only render. Returns null if there's nothing to emit
// or if the settings read fails — never break a public page.
//
// IMPORTANT — hydration correctness:
// Same as InjectedHead: each script descriptor is rendered into a real React
// <script> JSX element with proper attributes (src or dangerouslySetInnerHTML
// with a body that's </script>-free by contract). No nested-parse truncation.

import { readSettings } from "@/lib/settings-store";
import { renderBodyPixels, type PixelScriptDescriptor } from "@/lib/pixel-snippets";

export async function InjectedBody() {
  let settings;
  try {
    settings = await readSettings();
  } catch {
    return null;
  }
  const scripts = renderBodyPixels(settings);
  if (scripts.length === 0) return null;
  return (
    <div aria-hidden style={{ display: "none" }}>
      {scripts.map((s, i) => (
        <BodyPixelScriptElement key={`pix-body-${i}`} descriptor={s} />
      ))}
    </div>
  );
}

function BodyPixelScriptElement({
  descriptor,
}: {
  descriptor: PixelScriptDescriptor;
}) {
  if (descriptor.kind === "src") {
    return <script async src={descriptor.src} />;
  }
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: descriptor.body }}
    />
  );
}