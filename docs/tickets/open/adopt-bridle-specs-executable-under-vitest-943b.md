---
id: 943b
title: Adopt bridle specs, executable under vitest
kind: chore
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [83ya]
tasks: [mu-943b]
---

## The ask

The human, 2026-10-05: "I want this project to use bridle specs. I think
they should be fully supported under TypeScript testing under Vitest ...
Those specs should be really what drives the majority of the testing."
Lands after the v1 slices (wfbc, 5dj2, eqqv, 35z9).

- Specs live in `design/specs/<capability>.md` (bridle grammar:
  requirements `{#r-xxxx}`, scenarios `{#s-xxxx}` with WHEN/THEN, ids
  from `bridle spec id`). See bridle `docs/design/specs.md` and
  `specs-to-tests.md`, and meta-notes' `.bridle/rules/specs.md` and
  `design/specs/` for a working example.
- Wire bridle's typescript adapter, `vitest-bridle`
  (`/srv/shared/work/bridle-work/bridle/workflow/packs/typescript/adapters/vitest-bridle/`):
  vendor or `file:` it as a dev dependency (it must not be a runtime
  dependency: rule works-without-bridle), a `specs.test.ts` registering
  scenarios, and step files per capability.
- `npm run check` runs `bridle spec check --require-ids` and the spec
  tests. GitHub CI has no bridle binary yet: it skips the spec tests and
  the spec check (as meta-notes' CI does) and runs everything else.
- One small spec as a working example (e.g. the access rule: token
  required, paths confined), executable, passing.
- A project rule `.bridle/rules/specs.md`: behaviour is specified first;
  a task that changes behaviour edits its spec in the same branch;
  executable scenarios are the main tests, with plain vitest unit tests
  for internals the specs don't reach.
