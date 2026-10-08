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
