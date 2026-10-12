+++
id = "mu-6xc6"
title = "Agents can see the UI: a repeatable screenshot tool (Playwright or similar)"
kind = "feature"
state = "planned"
created_at = "2026-10-12T03:37:38.638Z"
updated_at = "2026-10-12T03:43:17.118068661Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "6xc6"
+++

docs/tickets/open/agents-can-see-the-ui-a-repeatable-screenshot-tool-playwrigh-6xc6.md

## Thread

### note · external:orchestrator · 2026-10-12T03:43:17.118Z
Plan (orchestrator): The human, 2026-10-11 (via aide m-0528): "it's fine, will save time; I installed it and pushed". playwright ^1.64.0 is already a devDependency on main (26f6ef0). No Playwright browsers are downloaded: launch the system Chrome (channel: "chrome", /usr/bin/google-chrome); do NOT run `npx playwright install`. Model: Sonnet. Verify: the command writes desktop and mobile PNGs, tree expanded and collapsed, and no server process is left running afterwards; attach one shot of Today to this thread. Out of scope: visual regression diffs and CI integration (not yet: no need until screenshots alone miss something).
