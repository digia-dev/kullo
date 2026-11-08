> Part of the `build` skill. Read the main `SKILL.md` first for the mode rules
> and the pipeline. This file is the look (appearance) workflow.

# Mode: Look

Use this mode when the goal is the page itself: rebuild a site's real content,
assets, responsive layout and interactions as working code. This is the
ai-website-cloner workflow.

Look mode is a faithful rebuild, not a redesign. Match the source first. Add
your own design direction only after the comparison is clean, and only if the
user asks.

## What this mode may use

Look mode reproduces the source's **real text and the files it actually loads**:
fonts, images, SVGs, video and icons. A same-named substitute from another
provider has different metrics or shapes.

- Download only what the page publicly serves and the clone needs. Record the
  source URL ? local path map.
- Check the content type and dimensions. A `.png` URL may return AVIF.
- Keep attribution and licence files for assets that require them.
- Do not reuse the site's proprietary JavaScript, CSS bundle or private APIs.
  Write the implementation fresh.
- If the user does not own the site, say what passing it off would mean and get
  explicit confirmation that this is a migration, study or other permitted use.

Function mode (the Replica phases) is different: it is clean-room and never
takes the target's copy, assets or brand. Do not mix the two rules.

## 1. Map the work

Read project instructions, the actual framework and scripts, and existing
routes. Open the source URLs with the available browser. Prefer direct HTTP,
asset tools or APIs for extraction when practical; use the browser to establish
appearance and behaviour.

Record a short source-to-local route map and the files each page owns. Follow
the app's conventions. In the Next.js template that is `src/app/`,
`src/components/sites/<site>/`, `public/sites/<site>/` and
`docs/research/<site>/`. Give origins, pages and downloads distinct names; add
a port or URL hash when readable names collide.

- A first root clone may replace the untouched template homepage.
- Preserve source pathnames for multiple pages from one origin. Query and
  fragment variations are usually states of the same route; reproduce them.
- Preserve existing authored routes and assets. Update them when requested and
  resolve unrequested collisions before replacing anything.
- When adding pages to an existing clone, extend its layout and global styles
  without replacing the styles used by existing pages.
- Use separate apps for different origins unless the user wants a combined app.
  Combined sites need distinct route prefixes and scoped fonts, styles and
  layout.
- Escape literal URL segments that conflict with framework syntax (`_`, `@`,
  brackets, parentheses) using its supported mechanism, then verify the actual
  requested URL.

Existing clones are useful starting points: compare them with the current
source and record what was reused. Finish when every requested URL has a
destination and file ownership is clear.

## 2. Observe before building

Inspect the whole page at desktop and mobile widths. Scroll top to bottom to
load lazy media and reveal sticky or pinned scenes. Then exercise menus, tabs,
accordions, carousels, hover states and primary links. Distinguish changes
driven by **scroll, click, hover or time**; a click imitation of a
scroll-driven section is a different product.

Treat each observation as one sample of a **rule**. Read declared values
(computed styles, CSS variables, a library's live options) rather than inferring
them from one rendering, and vary viewport width, viewport height, input and
state until you know what drives each change. Drive the page with the inputs
visitors use (wheel, touch, keyboard, pointer); scripted scrolling bypasses
behaviour attached to them, such as smooth scrolling.

Save source screenshots labelled with viewport, scroll position and interaction
state. Capture alternate-state content and assets. Keep one compact page brief:
section order, typography, layout measurements, asset mapping and interactions.
Add section briefs only when they help independent builders.

Read `references/inspection-guide.md` for extraction and state comparison. For
**Framer-generated pages, sticky scenes, reveal animations or animated media**,
read `references/framer-and-motion.md`.

Measure important geometry and computed styles. Inspect layered images and
media elements before rebuilding a visual as HTML. Finish when every section and
meaningful state has enough evidence to build, with unavailable details
identified. A large DOM dump does not replace looking at the page.

## 3. Build a complete first pass

Establish fonts, page width, colours, assets, routes, page-wide behaviour and
shared components first. Build each shared component with every observed state
(hover, focus, breakpoints) so builders reuse it as-is. Reuse fitting
components. Prefer CSS for layout and simple motion, and an animation library
when the source behaviour needs it.

Build coherent sections with real content. Delegate independent pages or
sections after shared files have an owner. Give builders screenshots, relevant
measurements and state notes, asset paths, destination files and a concrete
finish line. A concise brief with precise file references is enough; no fixed
agent count or per-component paperwork is required.

Recreate in-scope interactions. Preserve real outbound destinations. Rewrite
links to local routes when those routes are included; leave out-of-scope
destinations pointing to the source and disclose them. Visible controls must
perform the behaviour they promise.

Run the appropriate project check after an integrated slice. Finish this pass
when every requested section or route renders with actual assets and important
controls work.

## 4. Compare, repair, repeat

Open source and local pages at the **same viewport, scroll position and state**.
Let fonts, media and reveal animations settle. Review the whole page wherever
step 2 found a rule changing, plus a viewport wider than the design; judge
scroll and pointer behaviour with real input. A side-by-side montage locates
drift; full-size sections establish detail.

Fix the largest visible differences first: geometry, missing sections or layers,
typography and wrapping, asset crop, then spacing and motion. Recheck affected
views. Compare animated regions in initial, active and settled states, including
reverse scroll when relevant.

Exercise the real local workflow: navigation between cloned routes, mobile menu,
tab and accordion states, carousel boundaries, primary actions, media controls
and observed scroll-linked transitions. Check runtime errors, missing assets and
horizontal overflow. When adding pages, verify existing routes still work. Use a
few browser checks at these boundaries rather than assertions about class names.

Run the project's production check. Completion requires a successful build
**and** a rendered comparison. State remaining differences precisely instead of
calling an unchecked result pixel-perfect.

## The Next.js app

When the project is a Next.js app, follow its `AGENTS.md` if it has one and read
the version-specific guides in `node_modules/next/dist/docs/` before writing
code; some versions have breaking changes. Use its existing shadcn/ui
primitives, Tailwind tokens and `cn()` utility instead of adding a second
component system.

## Deliver

Return preview and run instructions, the source-to-local route map,
representative desktop and mobile comparisons, the checks actually run, and the
remaining visual and functional gaps. Keep reference clones in separate apps
when maintaining a reusable template.
