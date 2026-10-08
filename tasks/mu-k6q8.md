+++
id = "mu-k6q8"
title = "Login with expiring, revocable sessions instead of the shared token"
kind = "feature"
state = "planned"
created_at = "2026-10-08T01:51:06.814Z"
updated_at = "2026-10-08T03:33:02.739408443Z"
created_by = "external:aide"
watchers = ["external:aide"]
priority = "low"
priority_at = "2026-10-08T01:51:06.975097736Z"
+++

original id: k6q8

Login with expiring, revocable sessions instead of the shared token (ticket docs/tickets/open/login-*-k6q8.md; read it, including "The human's answer").

Approved: the human via aide, 2026-10-07: "It's not urgent, but I'd be happy to have a login and then a little CLI to hash the password and set it. I just want to call a CLI command and not have to mess with the files myself, like `create user`, give it a username and a password. I would say `create login username password`, and then the command would just write that to the appropriate place."

Decisions (orchestrator):
- The command lives in meta-notes-ui, next to the server that reads the file: `bin/meta-notes-ui create-login <username> [<password>]` (a small shim running the built server entry, like meta-notes' bin/meta-notes). With no password argument it prompts twice without echo (avoids shell history). It hashes with Node's built-in `crypto.scrypt` (random salt; no new dependency) and writes `<notes>/.meta-notes-cache/ui/login` (one user, mode 0600). Running it again replaces the login and revokes every session. It takes `--root` or finds the notes root like the server does.
- Sessions: a login form at `/login`; on success a random session id in an HttpOnly, Secure-when-HTTPS, SameSite=Lax cookie; sessions stored server-side (`.meta-notes-cache/ui/sessions.json`, ids hashed) with a 30-day expiry, sliding on use. A "Log out" control revokes this device's session. Add basic brute-force slowing (e.g. a fixed delay on a failed login); no lockout system.
- While no login file exists, the token works exactly as today. Once one exists, the token URL and token cookie stop working; keep `Authorization: Bearer <token>` only if something in this repo or deploy/ uses it (check), otherwise drop it with the token path.
- Reference: track-web (/srv/shared/work/track-web) has a login with hashed passwords and sessions; borrow its shape if you can read it, but don't add its dependencies.

Model: Sonnet. Size: M.
Files likely touched: server/app.ts, server/start.ts, server/token.ts, a new server/login.ts (+ test), a new bin/meta-notes-ui, client login page (client/src), client/src/style.css, README.md, deploy/ docs (the NUC unit and how to set a login), design/specs. Shares server/app.ts with nothing queued.
Verify: `npm run check` green once; tests for hash/verify, session expiry and revoke, the token still working with no login file, and the token refused once a login exists.
Rule human-server: never touch port 7480 or the meta-notes-ui unit; test with `npm run dev:example` or port 0. Switching the always-on server to a login is the human's step (run create-login); document it, don't do it.
Out of scope, not yet: multiple users (the human is the only user); a session list or "log out everywhere" UI beyond re-running create-login.

## Thread

### note · external:aide · 2026-10-08T01:51:06.975Z
priority: normal -> low

### note · agent:login · 2026-10-08T03:28:21.110Z
login: plan - server/login.ts (scrypt login file, hashed-id sessions.json), server-rendered /login form + POST /logout, token path off once a login file exists (Bearer dropped with it; only tests use it), bin/meta-notes-ui create-login, spec + docs, v0.13.0.

### note · agent:login · 2026-10-08T03:33:02.739Z
done 7a30a45 (v0.13.0). Check: 36 unit + 134 spec tests pass, build ok. Notes: login/sessions use a server-rendered /login form (no client page needed); /?token= in login mode redirects to /login; Bearer dropped with the token path (only tests used it). Server notices a new login file by stat, no restart. Always-on server NOT switched; steps in deploy/nuc.md. No CHANGELOG file exists.
