+++
id = "mu-ajk2"
title = "Login token cookie is wiped on a request that arrives without it"
kind = "fix"
state = "planned"
created_at = "2026-11-08T16:45:28.899Z"
updated_at = "2026-11-08T17:04:22.625149227Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
ticket = "ajk2"
+++

docs/tickets/open/login-token-cookie-is-wiped-on-a-request-that-arrives-withou-ajk2.md

## Thread

### note · agent:cookie · 2026-11-08T17:04:22.625Z
Done on bridle/cookie at fc97c73 (v0.29.1). Token visit sets SameSite=Lax; a request with no token cookie is 401 and leaves the cookie alone; a wrong sent cookie is cleared. Spec scenarios s-41b3, s-4530, s-e05a. npm run check exit 0 (s-4d43 skipped as expected). Browser cross-site check not done; curl checks only.
