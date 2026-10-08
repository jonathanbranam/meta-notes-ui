+++
id = "mu-dusy"
title = "Send a message to the notes advisor from the UI, as the human"
kind = "feature"
state = "planned"
created_at = "2026-10-08T22:28:45.144Z"
updated_at = "2026-10-08T22:30:49.562903309Z"
created_by = "external:aide"
watchers = ["external:aide"]
+++

original id: dusy
docs/tickets/open/send-a-message-to-the-notes-advisor-from-the-ui-as-the-human-dusy.md

Goal: a button in the UI sends a message, as the human, to the notes project's advisor. Send only.

Build the design in the ticket's "Design (orchestrator)" section; read it first. In short:
- Server flags --bridle-url, --bridle-token-file, --bridle-to (default external:advisor); all or none (error if partial).
- POST /api/message {body} behind the existing login; the server reads the token file on each send and calls POST <bridle-url>/v1/messages {"to": <bridle-to>, "body": <text>} with Authorization: Bearer <token>. Return the daemon's error text on failure (never the token). Reject an empty body.
- /api/version gains `message: true|false`; the client hides the button when false.
- Client: a top-bar button opens a sheet with a textarea and Send; success closes it with a short "sent" note; failure keeps the text and shows the error.
- deploy/meta-notes-ui.service and deploy/nuc.md: show the flags (NUC: http://127.0.0.1:7404 and /srv/shared/work/notes-work/.bridle/tokens/human). Record the design in the project's design doc or spec, per its conventions.
The daemon's message API is in the bridle repo (/srv/shared/work/bridle-work/bridle, docs/design/; `POST /v1/messages`); read, don't change it.

Check: project check green; server tests with a fake daemon (a local HTTP listener) for success, daemon error, missing flags (no route / message:false), and empty body. Do not send a real message to the live notes daemon.
Model: Sonnet.
Out of scope: replies, chat, choosing recipients.
