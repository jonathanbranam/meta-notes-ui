---
id: mu-x6nb
title: "Tag task view: list open tasks by tag across notes and check them off"
kind: feature
created: 2026-10-17
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

From the human (Sat 2026-10-17 9:20 AM ET, verbatim, relayed by aide on notes, m-0096):
"how can i see the online tasks I have? Can i see them in the notes ui? I should be able to pull
them all up together and click them off one by one. help me do that here, bt this should be a
non-agentic solution: 'I'm working on this set of tasks now that are grouped together'"

Approval: the human asked for this to be built ("help me do that here"); relayed via aide
(human via aide, m-0096), readied by orchestrator on that basis.

## Goal

A UI view that lists every open task carrying a given tag, across all notes, with the same
click-to-check boxes the note pages already have (v1.3, mu-eqqv), so the human can work a
grouped set of tasks without an agent.

- Entry points: clicking a marked `#tag` in a note (tags are marked today, r-d686, but not
  clickable), and a direct URL (e.g. `/#tag/online`) the human can bookmark.
- Source of truth is meta-notes: `meta-notes tasks --tag online` already returns the set in the
  CLI. Use the CLI (as v1.3 edits do), honouring tag aliases (r-d686 / n8w6).
- Each row: the task text, its note (link to it), and its checkbox. Checking it off goes through
  the same path as checking a task on its note page, and the row updates live.
- Today's test case: the human's 9 tasks tagged `#online`.

## Out of scope (not yet)

Multi-tag queries, saved groups, sorting/grouping options, a tag index page. Add when asked.

## Verify

A spec scenario in design/specs (tag view lists open tasks for a tag from the example root;
checking one marks it done in its note), `just check` green, and manual: open `/#tag/online`
on the always-on server and see the 9 tasks.

## Model

Sonnet (new route plus CLI integration).
