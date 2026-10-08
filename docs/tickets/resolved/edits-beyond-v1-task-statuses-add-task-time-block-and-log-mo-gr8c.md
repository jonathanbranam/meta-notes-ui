---
id: gr8c
title: "Edits beyond v1: task statuses, add task, Time Block and Log, move/rename/archive, whole note"
kind: feature
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [hzf9]
tasks: [mu-gr8c, mu-abe5, mu-rkrz, mu-xng2]
closed: 2026-10-08T03:35:55Z
---

## The ask

Not in the v1 order (v1 edits were task check-off and raw block edit); the proposed shape lists these CLI writes for later. Needs the human's yes before tasks.
- Task statuses: reopen a done task; set rescheduled, canceled, partial (meta-notes task update --status). Orchestrator: yes, small.
- Add a task to a note (task add). Orchestrator: yes, small.
- Time Block cell and row edits, Time Log append and update (time-block update/replace, time-log append/update). Orchestrator: yes, after the two above; the phone is where the Time Log gets filled.
- Move, rename, archive. Orchestrator: later; Vim and agents cover it.
- Edit a whole note as raw markdown (note write over all lines). Orchestrator: later; block edit covers most.
The spec (design/specs/edits.md) already holds these as non-executable requirements.

## The human's answer

From the human, via aide, 2026-10-07, verbatim: "gr8c yes". Asked against the aide's framing: yes to task statuses, add task, and Time Block / Time Log edits (in that order); move/rename/archive and whole-note edit stay later.
