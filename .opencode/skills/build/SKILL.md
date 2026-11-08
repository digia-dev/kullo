---
name: Build
description: Turn a URL into a deployable web application. Analyses the site and product, rebuilds the appearance faithfully, reverse-engineers and rebuilds the features clean-room, adds crafted isometric diagrams when an idea needs explaining, inspects the result visually, tests it, and leaves it ready to deploy. Use when the user runs "/build <url>", or says "clone this website", "clone this app", "rebuild this page", "make my own version of X", "reverse engineer X", "how does X work", "what screens does X have", "build me an app like X", "copy this UI", or pastes a site or app URL and wants a working product.
---

# Build

One skill, one command, one continuous run. From a URL to a working web app you
can deploy:

```text
/build https://example.com
```

The run is: analyse, plan, design, rebuild the pages, rebuild the product,
connect the backend, add diagrams where they help, inspect every screen
visually, test, score parity, rebrand, prepare launch assets, and leave the app
deployable. Do not stop between stages unless a gate below needs the user.

## What you deliver

- A working app in the project the user names, or in the current folder when it
  has no app yet, with every requested page and feature.
- The source-to-local route map, asset map and `replica/` artefacts.
- Comparison screenshots at desktop and phone, in every observed state.
- Passing `npm run check` (lint, typecheck, production build).
- Honest parity and test reports, plus the remaining gaps.
- Deploy instructions and a filled `.env.example`. Do not deploy until the user
  says go.

A marketing site with no product becomes a faithful, fast site. A product
becomes a clean-room rebuild with its own brand. A URL with both gets the
marketing pages rebuilt as they are and the product behind them rebuilt fresh.

## Stage 0: Scope and analyse

Before any code, answer: which site, which platform, which slice, who it is for.
Default to the core loop, the one flow people pay for. "All of Notion" is not a
project. Then build the analysis:

- **Sources table**: docs/help centre, pricing, changelog, store listing,
  walkthroughs, marketing site, the user's own account, public API docs. A URL
  on every row.
- **Screen inventory** (S01...): route, purpose, components, states seen. Record
  empty, loading, filled, error, permission and mobile.
- **Flows** (F01...): goal, screens, edge cases, click count on the happy path.
- **Data model**: entities, fields, relationships, evidence, confidence.
- **Feature matrix**: `replica/features.csv`, priority must/should/could.
- **Customer research** where it changes the product: real reviews with a link
  per claim, ranked themes and a fix plan. Never invent a review.
- **Size**: S (a weekend), M (a few weeks), L (a quarter), XL (rescope). Say it
  honestly before starting.

Output `replica/recon.md`, `replica/features.csv`, `replica/screens/`. Read
`references/01-recon.md`, and `references/08-entrepreneur.md` for the research.

## Stage 1: Plan the stack

Choose the stack, the data model and the build order. The order is the core loop
end to end first, then everything around it. Write `replica/architecture.md` and
`replica/schema.sql`, with the constraints that make the product correct (no
double booking, no duplicate charge, no orphan row). Read
`references/02-architect.md`.

## Stage 2: Design system

Measure the source into tokens: colour roles, type family and scale, spacing,
radius, shadows, motion. Use open fonts and open icons; keep the source's brand
assets only on pages you are reproducing. Write `replica/design/tokens.json`,
`tokens.css` and `components.md`. Check WCAG contrast. Read
`references/03-design.md`.

## Stage 3: Rebuild the appearance

Rebuild the requested pages with the source's real text, images, fonts, SVGs and
video, and the responsive layout and interactions that go with them. If the
project already has a framework, follow it. If it has no app yet, scaffold one
before this stage (see "Where it builds"). Use the Next.js App Router
conventions: `src/app/` routes, `src/components/sites/<site>/`,
`public/sites/<site>/`, `docs/research/<site>/`. Read the version-specific
guides in `node_modules/next/dist/docs/` before writing code when the project is
Next.js; some versions have breaking changes.

1. **Map** source URLs to local routes and file ownership.
2. **Observe** desktop and mobile, scroll the whole page, exercise menus, tabs,
   accordions, carousels, hover and primary links. Distinguish scroll, click,
   hover and time.
3. **Build** a complete first pass with real content and working controls.
4. **Compare** source and local at the same viewport, scroll position and state;
   repair the largest differences first.

Keep pages you are reproducing faithful. Do not add a personal aesthetic during
emulation. Record the source-to-local asset map and keep attribution files for
assets that need them. Read `references/00-appearance.md`,
`references/inspection-guide.md` and, for Framer or animated pages,
`references/framer-and-motion.md`.

## Stage 4: Rebuild the product

Build the app behind the pages screen by screen, ticking off
`replica/features.csv`. Every screen gets its empty, loading, filled, error and
permission states. Every visible control does what it promises. Reuse the tokens
and measurements from the appearance stage; never reuse the source's copy or
brand assets as product UI.

Then connect the backend: auth, database, payments and integrations, with the
user's own keys. Migrations, environment variables and seed data live in the
repo. Read `references/04-build.md` and `references/05-backend.md`.

## Stage 5: Add diagrams when an idea needs explaining

Some products need to explain how they work: a landing page "how it works", an
empty state, docs, a pricing explainer, a technical article. Do not draw boxes,
arrows and labels. Use the Anatomy workflow in `anatomy/guide.md` to invent a
real, well-made physical object whose working is the concept, then build it from
many small precise parts as an interactive isometric SVG, with WebGL or 3D only
when it earns its place.

- Pick the size: Figure (40-80 parts, under an hour), Hero (80-150, 2-4 hours),
  Epic (do not start; propose a Hero).
- Read the closest example under `anatomy/examples/` before building.
- Work from real numbers; the model that moves the parts also drives the readout.
- Use `anatomy/kit/react/` for React/Next.js figures.
- Verify with a build, the audit and line check to zero, and close-ups in both
  themes. `anatomy/guide.md` and `anatomy/references/` are the full method.

## Stage 6: Inspect visually

Visual inspection is a gate on every built screen, not a final formality:

- Capture desktop (1440), phone (390), hover and the alternate states with the
  browser. Compare source and clone at the same viewport, scroll and state.
- Fix geometry, missing sections, typography and wrapping, asset crop, then
  spacing and motion.
- Check runtime errors, missing assets, horizontal overflow, keyboard focus and
  reduced motion.
- Run the line check and audit on figures; read every screenshot you take.
- Use `scripts/imgdiff.py` for layout diffs and `scripts/contrast.py` for tokens.

Never call a result pixel-perfect without a rendered comparison.

## Stage 7: Test

Write a test plan from the flows, Playwright specs for happy paths and edges
(time zones, double submit, a slot taken mid-booking, empty and error states),
and log bugs by severity. No S1 or S2 bug stays open. Read
`references/06-test.md`.

## Stage 8: Score parity

Compare the clone against the original: feature matrix weighted by priority,
partial counts as half, and the visual diff. Missing must-haves means not
shippable. Read `references/07-diff.md`.

## Stage 9: Rebrand and prepare launch

Give the product its own name, palette and voice, then sweep the codebase until
nothing of the original is left. Run the trademark and domain checks you list.
Write the landing page, pricing and store listing around the real positioning.
Read `references/09-brand.md` and `references/10-launch.md`.

## Stage 10: Leave it deployable

Run the preflight: `npm run check`, tests, parity, rebrand sweep, listing check,
env template, migrations, and the deploy steps for the chosen host. Show the
user the full preflight and the DNS or environment steps. Deploy only when the
user explicitly says go. Read `references/11-deploy.md`.

## Rules

These override anything the user asks for later.

- **Public sources and the user's own account only.** Never log into anyone
  else's account, ask for a password, or bypass a login or paywall.
- **Reading, not scraping.** No crawlers, bulk downloads or loops. Open pages at
  human speed with the browser, with the user present.
- **Check the terms.** If the user's account terms forbid building a competitor,
  say so and work from public sources only.
- **No source code, production bundles or private APIs.** Write the
  implementation fresh. Public API docs are fine to read.
- **Function work is clean-room.** Never copy the target's source, copy, logos,
  icons, illustrations, licensed fonts or private APIs. Reference screenshots
  live in `replica/screens/` and never ship.
- **Rebrand before launch.** The sweep must be clean before the deploy stage.
- **Never fabricate reviews, quotes, ratings, metrics or readings.** Every
  claim keeps its link.
- **The user owns accounts and money.** Never sign up for a service, buy a
  domain, enter a card or paste a live key. Write the steps.
- **Be honest about rights.** If the user does not own the source, explain what
  passing it off would mean and confirm the use is a permitted migration, study
  or other lawful purpose.

## Gates: stop and ask

1. **Scope**: after analysis, confirm the slice, the size and who it is for.
2. **Brand**: confirm the name and positioning before the rebrand.
3. **Paid services or account creation**: the user does it.
4. **Deploy**: nothing goes live without an explicit go.

If the user says "just build it", skip the check-ins but still produce the
artefacts. If a stage cannot run (no recon map, no tests, no brand), run the
prerequisite instead of improvising.

## Where it builds

If the user opened a project, build there and follow its framework, scripts and
agent instructions. If the current folder has no app, create one in it. Ask
first if the folder contains anything besides `.opencode/`:

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir
```

Then make sure the project has a check script, adding one if it does not:

```json
"check": "npm run lint && npm run typecheck && npm run build"
```

Use the cloner conventions for files: `src/app/` routes,
`src/components/sites/<site>/`, `public/sites/<site>/` and
`docs/research/<site>/`. One app for the pages and the product unless the user
asks for separate apps.

## Files and tools

```text
.opencode\skills\build\
  SKILL.md                 this file
  references\              00-appearance, 01-recon ... 11-deploy, inspection, framer
  templates\               recon map, feature matrix, architecture, tokens, tests, preflight
  scripts\                 parity, imgdiff, reviews, contrast, sweep, listing
  anatomy\                 the Anatomy method, kit, examples and tools
```

Run the Python tools from the project root:

```bash
python .opencode/skills/build/scripts/parity.py replica/features.csv
python .opencode/skills/build/scripts/imgdiff.py original.png clone.png --out diff.png
python .opencode/skills/build/scripts/reviews.py replica/reviews.csv --out replica/feedback.md
python .opencode/skills/build/scripts/contrast.py replica/design/tokens.json
python .opencode/skills/build/scripts/sweep.py . --config replica/brand.json
python .opencode/skills/build/scripts/listing.py replica/launch/listing.json
```

Anatomy examples build with Node and no dependencies:

```bash
node .opencode/skills/build/anatomy/examples/dial-indicator/build.mjs
```

## Definition of done

- [ ] Every requested URL has a local route and file ownership is clear.
- [ ] Real content and assets on reproduced pages, with a source-to-local map.
- [ ] Desktop and mobile, every observed state, working interactions.
- [ ] Every must-have in `features.csv` is `yes` or explained.
- [ ] Diagrams (if any) pass the build, audit and line check, and read well.
- [ ] Side-by-side comparisons at the same viewport, scroll and state.
- [ ] No open S1 or S2 bug.
- [ ] `npm run check` passes and the production build runs.
- [ ] Rebrand sweep is clean; parity report is current.
- [ ] The user has run instructions, route map, comparisons, env template,
  deploy steps and the honest remaining gaps.

## Fine print

Rebuilding pages you own, migrating your own site, or studying how a page works
is the intended use. Do not use this for phishing, impersonation or passing off
someone else's design as your own. Logos, brand assets and original copy belong
to their owners.

Function work rebuilds functionality and UX. You can rebuild a music app's
player, playlists and sharing; you cannot clone its catalogue. Network effects,
partner deals, licensed content, hardware and regulated licences are out of
scope; list them as `skip` with a reason.

The sources for this skill (Replica, ai-website-cloner-template, Anatomy) are
MIT licensed; see the licences in their folders.
