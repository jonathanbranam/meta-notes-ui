---
id: specs
severity: must
roles: [manager, worker]
---
Behaviour is specified first, in `design/specs/<capability>.md` (bridle
grammar). A task that changes behaviour edits its spec in the same branch as
the code and tests; the branch diff is the spec delta.

- Grammar: `### Requirement: <name> {#r-xxxx}` with a SHALL statement, then
  `#### Scenario: <name> {#s-xxxx}`, a `*Verification*: **executable**` or
  `**non-executable**` line, and `- **WHEN**` / `- **THEN**` bullets. Run
  `bridle spec id` to give new headings ids; never edit or reuse one.
- Executable scenarios are the main tests. Each runs under vitest through
  `specs.test.ts` (the vendored `tools/vitest-bridle` adapter), with step
  definitions in `specs/steps/<capability>.ts`. Write plain vitest unit tests
  only for internals the specs don't reach.
- `npm run check` runs `bridle spec check --require-ids` and the spec tests
  (`npm run test:specs`). They are skipped when the `bridle` binary is absent,
  as in GitHub CI; the rest of the check still runs. The adapter is a
  dev-only dependency (rule works-without-bridle).

Why: the human, 2026-10-05: specs "should be really what drives the majority
of the testing."
