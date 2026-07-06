// <InjectedHead /> — server-renders tracking pixels (head-placed) and custom
// <meta> tags into the public site's <head> on every public page request.
//
// Reads from lib/settings-store.ts. Returns null on read failure — never
// break a public page.
//
// IMPORTANT — hydration correctness:
// renderHeadPixels() returns typed descriptors (src | inline), NOT raw HTML
// strings with literal <script>...</script> markup. We render each as a real
// React <script> JSX element with proper attributes (src for src-kind,
// dangerouslySetInnerHTML for inline-kind). For inline bodies the body is
// guaranteed </script>-free (provider-specific), so no nested-parse
// truncation. Next 14 hoists the resulting <script> elements to <head>.

import { readSettings } from "@/lib/settings-store";
import { renderHeadPixels, type PixelScriptDescriptor } from "@/lib/pixel-snippets";

export async function InjectedHead() {
  let settings;
  try {
    settings = await readSettings();
  } catch {
    return null;
  }

  const scripts = renderHeadPixels(settings);
  const enabledMetas = settings.meta_tags.filter(
    (m) => m.enabled && m.name.trim() && m.content.trim(),
  );

  return (
    <>
      {scripts.map((s, i) => (
        <PixelScriptElement key={`pix-${i}`} descriptor={s} />
      ))}
      {enabledMetas.map((m) => (
        <meta key={m.id} name={m.name} content={m.content} />
      ))}
    </>
  );
}

function PixelScriptElement({
  descriptor,
}: {
  descriptor: PixelScriptDescriptor;
}) {
  if (descriptor.kind === "src") {
    // Real src-bearing script: <script async src="..." />. The browser
    // parses this as a self-contained script element. No inner </script>
    // exists (closing tag is just `</script>` literal but it appears AS the
    // element close — exactly what we want).
    return <script async src={descriptor.src} />;
  }
  // Inline script: body is plain JS (or admin's literal). It MUST NOT
  // contain "</script>" — see lib/pixel-snippets.ts contract. The body is
  // emitted via dangerouslySetInnerHTML; React renders an outer <script>
  // whose inner text is exactly the body, with no nested-parse risk.
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: descriptor.body }}
    />
  );
}
