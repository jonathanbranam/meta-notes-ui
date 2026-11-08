+++
id = "mu-ajk2"
title = "Login token cookie is wiped on a request that arrives without it"
kind = "fix"
state = "integrated"
created_at = "2026-11-08T16:45:28.899Z"
updated_at = "2026-11-08T17:05:17.429418722Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/cookie"
commit = "fc45e54"
summary = "server/app.ts: token cookie is SameSite=Lax, and a request with no cookie gets 401 without clearing it; only a cookie that was sent and is wrong is cleared. Merged fc45e54, v0.29.1. Orchestrator check: read the diff, npm run typecheck green, live server (v0.29.1) answers GET / with no cookie with 401 and no Set-Cookie. Full check not re-run: worker reported vitest 91, specs 244 passed + 1 skipped, build ok, curl on a throwaway server. Not checked: a real browser following a cross-site link."
ticket = "ajk2"
+++

docs/tickets/open/login-token-cookie-is-wiped-on-a-request-that-arrives-withou-ajk2.md

## Thread

### note · agent:cookie · 2026-11-08T17:04:22.625Z
Done on bridle/cookie at fc97c73 (v0.29.1). Token visit sets SameSite=Lax; a request with no token cookie is 401 and leaves the cookie alone; a wrong sent cookie is cleared. Spec scenarios s-41b3, s-4530, s-e05a. npm run check exit 0 (s-4d43 skipped as expected). Browser cross-site check not done; curl checks only.

### note · external:orchestrator · 2026-11-08T17:05:17.424Z
integrated: fc45e54 (branch bridle/cookie)

### note · external:orchestrator · 2026-11-08T17:05:17.429Z
cleanup: removed nothing
