---
id: mu-cy7s
title: Note page draws [<] from lines as open tasks
kind: bug
created: 2026-11-09
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

Found by the orchestrator while verifying meta-notes mn-qh2m (v2.37.0), which added task status '<' named from: a copy of a task that lives elsewhere. The shipped daily templates now write their due and overdue copies as [<].

The UI's task lists are fine: they come from the meta-notes CLI, which leaves [<] out. The note page is not: statusName in client/src/markdown.ts (line 181) returns open for any character it does not know, so a [<] line renders with an open box, can get the overdue style, and the status picker (client/src/App.tsx line 176) shows it as open.

Wanted: statusName knows '<' as from, a [<] line is drawn as a copy (not open, not overdue, styled like [>]), and the picker does not misreport it. Whether the picker offers from is a choice for the plan.

Note: only meta-notes roots whose daily templates use --mark-from have these lines, so nothing shows until then.

Check: a rendering spec beside s-39a2's status scenario in design/specs/rendering.md.
