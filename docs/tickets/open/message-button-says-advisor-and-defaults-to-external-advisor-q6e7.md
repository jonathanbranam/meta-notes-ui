---
id: mu-q6e7
title: Message button says advisor and defaults to external:advisor; it should be the notes aide
kind: bug
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-dusy, mu-5tju]
---

## The ask

From the human (Sat 2026-11-07, to aide, verbatim): "Okay, that's a bug. That messages thing is an
existing bug that we haven't fixed, so let's file that and get it fixed immediately. I've stopped
using Advisor for this, and those messages should go to the Aide now. Obviously, I don't use that
button very often, or I would have noticed before now."

Finding (aide): on the always-on server the messages already reach the notes aide: the unit runs
with `--bridle-url http://127.0.0.1:7404` (the notes daemon) and `--bridle-to external:aide`. What
still says advisor:

- `client/src/App.tsx:265`: placeholder "Message to the advisor" (and the comment at :247).
- `server/start.ts:50`: `--bridle-to` defaults to `external:advisor`.
- `server/app.ts:45` comment, `specs/steps/message.ts:52`, and the deploy docs.

## Fix

The button and sheet name the notes aide; `--bridle-to` defaults to `external:aide`; specs, comments
and docs follow. The always-on unit keeps working unchanged.

## Check

Spec for the message sheet shows the aide wording and sends to `external:aide` by default; check
green; the phone shows "Message to the aide" after the update.
