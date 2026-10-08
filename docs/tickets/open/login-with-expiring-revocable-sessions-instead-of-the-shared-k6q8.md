---
id: k6q8
title: Login with expiring, revocable sessions instead of the shared token
kind: feature
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

From the human, via aide, 2026-10-07, verbatim (first day on the always-on server, phone over Tailscale):

"Also, the token is fine, but why not log in? It's not really that hard. We have login and track-web, and we have login and the bridle gateway (bridle-ui gateway). The token is fine for now, but login would be good. Does the token ever expire, or can we expire it from our side?"

## How it works today (the aide read server/app.ts and server/token.ts)

- One token in `<notes>/.meta-notes-cache/ui/token`, made on first start, read once at server start. It never expires.
- `GET /?token=` sets cookie `mn_ui_token` holding the token itself, max-age one year. So every logged-in device holds the master secret, and logging one device out means changing it for all.
- Expire it today: delete the token file and `systemctl --user restart meta-notes-ui`; a new token is made and every device must log in again.

## The ask (no task until the human asks)

- A login, as track-web and the bridle gateway have, instead of (or alongside) the token URL.
- Sessions that expire and can be revoked per device, without changing a shared secret.
- Reuse what track-web or the gateway already do rather than inventing a scheme; which one fits is open.

## Out of scope

Multiple users; the human is the only user.

## The human's answer

From the human, via aide, 2026-10-07, verbatim:

"It's not urgent, but I'd be happy to have a login and then a little CLI to hash the password and set it. I just want to call a CLI command and not have to mess with the files myself, like `create user`, give it a username and a password. I would say `create login username password`, and then the command would just write that to the appropriate place."

- Approved, not urgent (low priority).
- A CLI command that takes a username and password, hashes the password and writes it where the server reads it; the human never edits the file. Their words for it: `create login username password`. Where the command lives (a meta-notes-ui script, or `meta-notes ui ...` in meta-notes) is the orchestrator's call.
- The aide's note: a password given as an argument lands in shell history; also accepting it from a prompt when omitted would avoid that, without changing the form the human asked for.
