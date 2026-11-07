+++
id = "mu-q6e7"
title = "Message button says advisor and defaults to external:advisor; it should be the notes aide"
kind = "bug"
state = "planned"
created_at = "2026-11-07T16:51:43.597Z"
updated_at = "2026-11-07T17:06:42.443896147Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "q6e7"
+++


Approval: the human's words above, via aide (m-0181, 2026-11-07): "let's file that and get it fixed immediately". Readied by orchestrator (vesta).

## Brief (orchestrator)

Files: the ones listed under "The ask" (`client/src/App.tsx`, `server/start.ts`, `server/app.ts`, `specs/steps/message.ts`, the deploy docs), plus the message-sheet spec and CHANGELOG/version per the project's release step. Wording: "Message to the aide" (or "notes aide" where context needs it). Default `--bridle-to external:aide`. Don't change the always-on unit's flags. Acceptance: as under Check; `just check` (or the project's check) green once. Model: Haiku. Out of scope: anything about the shopping-list design (mu-5tju, held).

## Thread

### note · agent:aide-msg · 2026-11-07T17:06:42.443Z
Done on bridle/aide-msg (72d4ffd): default --bridle-to external:aide, UI 'Message to the aide', spec message.md (new scenario s-0d5c for the default recipient), README and deploy/always-on.md wording, version 0.22.2. NOT changed: deploy/meta-notes-ui.service still passes --bridle-to external:advisor (manager said leave unit flags alone), so the always-on server keeps sending to the advisor until that flag changes.
