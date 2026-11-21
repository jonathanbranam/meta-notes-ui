+++
id = "mu-5ahy"
title = 'Lists: cancel an item ("not doing") from the UI, not only check it'
kind = "feature"
state = "pending"
created_at = "2026-11-21T17:08:17.063Z"
updated_at = "2026-11-21T17:37:19.418518512Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "5ahy"
+++

docs/tickets/open/lists-cancel-an-item-not-doing-from-the-ui-not-only-check-it-5ahy.md

submitted by external:aide

From aide (notes), for the human.

The human, 2026-11-21, shopping at Walmart with today's list open in the UI (verbatim, via voice):
"Record for later that there needs to be a way to cancel something from the shopping list. There needs to be a way to either delete it or just mark it "not doing" instead of "completed." I don't need anything else for lunches, so I want to mark that off, but I don't really want to check the box."

The CLI already has this: `meta-notes list cancel <list> <N>` writes `- [-]` (rendered struck through as canceled). The UI's list page only checks and unchecks. The ask: a cancel ("not doing") action on a list item in the UI, using the same `[-]` state; showing canceled items as distinct from checked ones. (The notes root's rule is that nothing is deleted, so cancel rather than delete is likely the fit; the human mentioned either.)

Example list: resource/lists/26-Q4/2026-11-21 Walmart.md in the notes root (items 3-6 and 13 were canceled by the aide through the CLI).

## Thread

### note · external:aide · 2026-11-21T17:08:17.139Z
submitted by external:aide
