---
name: verify-personal
description: Quick personal verification — typecheck, lint, dev build smoke, and confirm the app responds on http://localhost:3000. Use when you say "verify", "check it builds", "does it still run", or before pushing.
---

# /verify-personal

Run a fast sanity pass on the current branch before committing or pushing. Designed for solo/hackathon pace — not a substitute for the full test suite.

## What it does

1. **Detect scripts** — read `package.json` and pick whichever of these exist:
   - `typecheck` / `type-check` (usually `tsc --noEmit`)
   - `lint`
   - `build`
   - `test`
   If none of the relevant ones exist, report that and stop — don't guess.

2. **Run them sequentially**, stopping on the first failure:
   - typecheck → lint → test → build

3. **Dev smoke (optional, non-blocking)**:
   - If `dev` script exists, spin it up in the background, curl `http://localhost:3000`, then kill it.
   - Treat non-2xx response as a soft warning, not a hard fail.

4. **Report** a one-line summary per step: pass / fail / skipped + the exact command run. No long stack traces — if something failed, just point to the failing command and exit code.

## Output format

```
typecheck: PASS (tsc --noEmit, 1.2s)
lint:      PASS (next lint, 3.4s)
test:      SKIP (no test script)
build:     PASS (next build, 12.1s)
smoke:     WARN (curl localhost:3000 → 200 in 0.4s)
```

## Rules

- Never modify source. Verification only.
- If `package.json` doesn't exist yet, bail out with a clear message — don't invent commands.
- Background `dev` server must always be killed before returning, even on failure.