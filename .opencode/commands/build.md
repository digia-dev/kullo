---
description: Build a deployable web app from a URL — clone the look, rebuild the features, add diagrams, inspect visually and ship it
agent: builder
---

Load the `build` skill with the `skill` tool, then run the full pipeline for: $ARGUMENTS

If no URL is given, ask for one and stop.

This is one continuous run: analyse, plan, design, rebuild the pages, rebuild the
product and its backend, add an Anatomy figure only where an idea needs
explaining, inspect every screen visually, test, score parity, rebrand, prepare
the launch, and leave the app deployable. Do not ask "look or function"; the
default is both. If the target has no product, build the pages; if it is behind
a login, build the product the user owns.

Pause only at the gates: scope and size, brand name, paid services or account
creation, and the production deploy. Everything else, build it.

Finish with `npm run check` passing, comparison screenshots, the route map, the
env template and the deploy steps. Never deploy without an explicit go.
