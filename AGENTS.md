<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-rules -->
## Git / GitHub rules (owner instruction, 2026-11-08)

- **NEVER `git push` to any remote without an explicit instruction from the user to push.** Local commits are fine only as part of a task the user asked for; pushing is always a separate, explicit decision.
- Never force-push, delete/rename remote branches, rewrite history, or change repo visibility/settings without explicit instruction.
- The repo is public by owner's choice; do not add or remove files in bulk without asking.
- If unsure whether something counts as "an order to push" — ask. The answer "use this remote" is not a standing push authorization.

<!-- END:git-rules -->

<!-- BEGIN:design-rules -->
## Design rules (owner instruction, 2026-11-09)

- `DESIGN.md` at the repo root is the **source of truth** for all visual work — it is the Fluent 2 design system. Read it before changing any UI.
- `MOBILE.md` is the source of truth for mobile layout, navigation and interaction (bottom nav, header, touch targets, sheets). Read it before changing mobile UI.
- Tokens live in `src/app/globals.css` (`:root`) and `replica/design/tokens.json`; change them together. No raw hex in components — extend a token (SVG illustration palettes only exception, must use DESIGN.md §2 values).
- `"Segoe UI"` is a **system font stack**, owner-approved: never bundle or download Segoe UI font files; system fallbacks handle other platforms.
- Avoid gradients, glassmorphism, neon colours, oversized rounded cards, decorative shadows (DESIGN.md §19).
- Verify every visual change: `contrast.py` → 0 AA failures, screenshots at 1440 and 390, `npm run check`, `npm test`, and update `replica/build-log.md`.
- Conflicting design request → surface the conflict and ask before overriding DESIGN.md.

<!-- END:design-rules -->
