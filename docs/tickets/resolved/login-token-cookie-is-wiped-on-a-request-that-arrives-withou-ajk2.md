---
id: mu-ajk2
title: Login token cookie is wiped on a request that arrives without it
kind: fix
created: 2026-11-08
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
resolved: 2026-11-08T17:05:17Z
---

## The ask

The human, 2026-11-08 11:44 AM (via aide, m-0210, verbatim): "the token isn't being saved". Aide relayed: "Please file and schedule it."

## Problem
What aide verified with curl against https://vesta.tailbc91f5.ts.net:
- `GET /?token=<good>` returns 302 to `/` with `Set-Cookie: mn_ui_token=...; Max-Age=31536000; Path=/; HttpOnly; SameSite=Strict`.
- `GET /` with no cookie returns 401 and `Set-Cookie: mn_ui_token=; Max-Age=0`, so a request that lacks the cookie deletes it.
- The token file is unchanged since 2026-10-07, so this is not token rotation.

Likely cause, NOT reproduced in a browser: on a link followed from another site, SameSite=Strict withholds the cookie, including on the 302 back to `/` after a token login. That request gets 401 and the good cookie is wiped.

The code: server/app.ts, the token branch. `setCookie` with `sameSite: "Strict"` (about line 142) and `deleteCookie(c, COOKIE)` on any request without a matching token (about line 149).

## Ask
1. A request that carries no token cookie gets 401 and does not touch the cookie. Only a cookie that was sent and is wrong may be cleared.
2. The token cookie is SameSite=Lax, matching the session cookie (design/specs/access.md, the login requirement), so a top-level link from another site carries it.

## Files likely
server/app.ts, design/specs/access.md, specs/steps/access.ts.

## Check
The repo's check (`npm run check`) green. Spec scenarios: a request with no cookie gets 401 and no Set-Cookie; a request with a wrong cookie gets 401 and the cookie cleared; the visit URL sets a SameSite=Lax cookie. Reproduce in a browser if one is available: open a token link from another origin, then confirm the cookie survives a reload.

## Model
Haiku (small, clear server change with specs).

## Not in this ticket
The session cookie's own deleteCookie on a missing session (about line 132): it is already Lax and deleting a cookie that was not sent is harmless there. Setting a login on the always-on server (mu-q8f8, the human's), which turns token auth off and sidesteps this bug.
