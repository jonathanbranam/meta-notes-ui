---
id: ma6v
title: "Trip timer: a big Left / Arrived button that logs the trip to the Time Log"
kind: feature
opened: 2026-10-06
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [35z9]
tasks: []
---

## The ask

From the human, via advisor (notes project, message m-0097, 2026-10-06), verbatim:

"I really like measuring things, like keeping track of how long it takes me to get to work, but it's a little bit too irritating to narrate all of this over remote control as well. This would be a couple of features for the mobile app: 1. A start/stop button that can be used for things that are happening. If I want to track how long it takes me to get to work, the app should have a big, big button that says 'Left' right now. If it's almost time to leave, the app should just automatically show that, and I'd tap that button when I'm leaving. It would change to 'Arrived,' and I'd tap it when I arrived."

Context from the advisor: today's drive was 8:43-8:56 with a detour; the taps would land as Time Log entries.

## The ask

- A large start/stop button in the app: "Left", then "Arrived".
- Shown automatically when it's nearly time to leave (from the Time Block or a routine; how it knows is open).
- Each tap writes a Time Log entry through the CLI (`meta-notes time-log append`), so the trip's duration is recorded.

Pending: idea only, no task until the human approves it.

## The human's answer

From the human, via aide, 2026-10-07, verbatim: "ma6v - yes where would the button live? I need to probably look at the UI first before approving a design."

Yes to the idea; the design (where the button lives, how it appears near leaving time) is not approved. The human wants to see the UI first, once the always-on server (mkkt) is up. Builds after gr8c's Time Log edits.

## Where the button lives (orchestrator's proposal, 2026-10-07; not approved)

The human asked "where would the button live?" Two options:

- **A. Top of the Today view (recommended).** The Today view is what the phone
  opens to. Near leaving time a full-width "Left" button sits above everything
  else; at other times a small "Start trip" link sits in the Time Log section.
  After "Left", the button turns into "Arrived" and also shows as a slim banner
  on every other screen, so an open trip can't be lost. Nothing else on screen
  changes.
- **B. A floating button on every screen** (bottom right, in thumb reach),
  always there, growing to full width near leaving time. Always one tap away,
  but it covers content on every note.

"Near leaving time" (suggestion): 10 minutes before a Time Block row whose Plan
says "drive", "commute" or carries a `#commute` tag, until 30 minutes after.
Each tap is one `time-log append` (Left starts "- Drive", Arrived closes it).

Builds after gr8c's Time Log task (mu-xng2) and after the human has seen the
UI on the always-on server (mkkt) and picked a design.
