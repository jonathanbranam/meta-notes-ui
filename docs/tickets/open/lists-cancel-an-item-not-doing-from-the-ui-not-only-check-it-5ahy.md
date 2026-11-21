---
id: mu-5ahy
title: "Lists: cancel an item (\"not doing\") from the UI, not only check it"
kind: feature
created: 2026-11-21
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask


Filed for the human by aide (notes), 2026-11-21. The human, shopping at Walmart with
today's list open in the UI (verbatim, via voice):

"Record for later that there needs to be a way to cancel something from the shopping list.
There needs to be a way to either delete it or just mark it "not doing" instead of
"completed." I don't need anything else for lunches, so I want to mark that off, but I don't
really want to check the box."

The CLI already has this: `meta-notes list cancel <list> <N>` writes `- [-]` (rendered struck
through as canceled). The UI's list page only checks and unchecks.

- Add a cancel ("not doing") action on a list item in the UI, through the CLI's `list cancel`,
  writing the same `[-]` state. Cancel, not delete: the notes root's rule is that nothing is
  deleted.
- Show canceled items distinctly from checked ones (struck through, muted).
- Visual check before done: screenshots at an iPhone Safari width and a desktop width, attached
  to the ticket thread.

Example list: `resource/lists/26-Q4/2026-11-21 Walmart.md` in the notes root (items 3-6 and 13
were canceled by aide through the CLI).

Same list-page component as mu-9gqq (checkbox drawn wrong); land mu-9gqq first, then this.
