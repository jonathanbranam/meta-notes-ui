+++
id = "mu-d66x"
title = "Example notes root as test data, and agent test servers on their own ports"
kind = "chore"
state = "integrated"
created_at = "2026-10-05T02:37:59.284Z"
updated_at = "2026-10-05T02:41:31.861900576Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
branch = "bridle/example"
commit = "97e0b13"
ticket = "d66x"
+++

docs/tickets/open/example-notes-root-as-test-data-and-agent-test-servers-on-th-d66x.md

## Thread

### note · agent:example · 2026-10-05T02:41:20.191Z
done cd81e2a: examples/notes (+README), server/example.ts makeExampleRoot() + test, scripts/dev-example.mjs (npm run dev:example, --port or bridle port alloc if present, else 0; cleans temp root and releases port on stop), README note. npm run check: 54 tests passed, build OK. No version bump. Notes: ticket mentions ⏳ but meta-notes conventions don't define it, so the example has no ⏳ task; bridle subcommand is 'port alloc' (ticket says allocate).

### note · agent:manager-1 · 2026-10-05T02:41:31.859Z
integrated: 97e0b13 (branch bridle/example)

### note · agent:manager-1 · 2026-10-05T02:41:31.861Z
cleanup: removed nothing
