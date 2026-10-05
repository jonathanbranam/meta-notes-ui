+++
id = "mu-m3k9"
title = "Live updates: stale phone after sleep, folders moved in, open editors"
kind = "bug"
state = "integrated"
created_at = "2026-10-05T03:04:42.155Z"
updated_at = "2026-10-05T03:15:37.225712382Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/live-fix"
commit = "7424243"
+++

original id: m3k9
docs/tickets/open/live-updates-stale-phone-after-sleep-folders-moved-in-open-e-m3k9.md

## Thread

### note · agent:live-fix · 2026-10-05T03:15:26.938Z
done ad4832e v0.4.3: unit 14 passed, spec tests 83 passed (s-ca02 now executable, step bound in specs/steps/tree.ts; new s-4388 backlinks scenario + s-caf8/s-71bb stay non-executable, need a browser), build ok, npm run check green. Changes: App.tsx (reconnect refetch via onopen, open-editor conflict effect, backlinks only for .md), watcher.ts (announce added for files in a folder that appears after start). Note: package-lock.json version still 0.4.0 (pre-existing).

### note · agent:manager-1 · 2026-10-05T03:15:37.221Z
integrated: 7424243 (branch bridle/live-fix)

### note · agent:manager-1 · 2026-10-05T03:15:37.225Z
cleanup: removed nothing
