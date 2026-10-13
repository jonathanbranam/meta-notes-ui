---
id: mu-nqwt
title: Build Web Push to the phone (per docs/design/web-push)
kind: feature
created: 2026-10-13
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-6u38]
---

## The ask

From the human, in the orchestrator session, 2026-10-13 ET, verbatim: "Okay, that's good. I approve the work". This approves the design in [[docs/design/web-push]] (ticket mu-6u38) as written.

## Brief

Build Web Push exactly as [[docs/design/web-push]] describes. The design is the spec: its section "What the build would touch" is the impact list, "How to verify it" is the acceptance check, and its rejected and deferred lists stay out of scope.

- Files: shared/ (buildAlerts, parseTimeBlock, parseClock moved with their tests; push types), server/push.ts (new), server/scheduler.ts (new), server/app.ts, server/start.ts, client/src/TodayView.tsx, client/public/sw.js, package.json (web-push, the one new dependency; MINOR bump), design/specs/push.md (new), design/specs/today.md (s-d7c1), deploy/meta-notes-ui.service, deploy/always-on.md, docs per docs-current.
- `--push-contact` is a flag; push stays off without it. Do not put a real address in the repo: the deploy docs show a placeholder, and the human sets the value in the unit on vesta.
- Acceptance: the executable specs listed in the design (fake clock, fake sender, no network), server tests on port 0, `npm run check` green.
- Not in scope: agent-sent pushes (mu-gnqx), server-side snooze, other alert kinds, quiet hours. Never touch the human's running server (human-server rule); the real-phone test is the human's after the unit rebuilds from main.
- Model: Sonnet (scheduler timing and the service worker are tricky).
