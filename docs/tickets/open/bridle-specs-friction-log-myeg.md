---
id: myeg
title: Bridle specs friction log
kind: chore
opened: 2026-10-05
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: [943b, hzf9]
tasks: []
---

## The ask


A running record of every problem meta-notes-ui runs into with bridle specs
(the spec format, `bridle spec`, vitest-bridle, the specs workflow). Not a
task: it stays open while we use specs. Each entry is sent to bridle for
triage (`bridle ticket submit --project bridle`), and its bridle ID is noted
here. Fixes inside this repo get their own tickets.

Add an entry when a worker, the manager or the orchestrator hits one: date,
what happened, where it came from, the bridle ID.

## Log

- **2026-10-05: CI never runs the specs.** vitest-bridle reads scenarios from
  `bridle spec export` at collection time, so it needs a bridle binary; CI has
  none and the spec tests skip. Regressions are caught only by workers' local
  `npm run check`. From mu-943b. Bridle: br-pakx.
- **2026-10-05: vendored vitest-bridle will drift.** Copied into
  `tools/vitest-bridle` as a `file:` dependency; nothing says when bridle's
  copy changes. From mu-943b. Bridle: br-m4cx.
- **2026-10-05: step files aren't typechecked.** `specs.test.ts` and its steps
  aren't covered by `tsc`; vitest only transpiles. The vitest-bridle setup
  doesn't cover it. From mu-943b. Bridle: br-2d6x.
- **2026-10-05: entry-script and cross-repo behavior can't be executable.**
  Access spec: server start, `server.json`, default host, exit codes live in
  `server/index.ts` (a top-level script); the token URL printed and opened by
  `meta-notes ui` lives in another repo. Both specified non-executable. From
  mu-hzf9. Bridle: br-mh62. (Local fix for the first: split `startServer()`
  out of `server/index.ts`; to be ticketed with the spec gaps.)
- **2026-10-05: no rule for unit tests a scenario duplicates.** mu-943b left
  the duplicated access unit tests; mu-hzf9 removed them. From mu-943b,
  mu-hzf9. Bridle: br-m5kf.
- **2026-10-05: browser scenarios can't be executable.** Tree spec: live
  refresh of the open note and tree, the editor's conflict view, and the
  browser reconnecting after a phone sleeps are all non-executable;
  vitest-bridle has no DOM or browser harness. From mu-9dv8. Bridle: br-ekfw.
- **2026-10-05: step text can't quote code or markup.** `bridle spec check`
  rejects backticks, `<code>` and HTML in steps, so the rendering spec can't
  quote the markdown it renders or the HTML it expects; the worker rephrased
  and normalised quotes in step code. From mu-pfgp. Bridle: br-awh4.
- **2026-10-05: `bridle spec id` duplicated hand-written IDs.** On a spec file
  already holding IDs written by hand, it added duplicate `.ids` entries; the
  worker reset `.ids` and re-ran. From mu-pfgp. Bridle: br-dbvd.
- **2026-10-05: a step can't skip its scenario at runtime.** The agenda
  scenario runs `meta-notes init` for a `.venv` and must skip with a reason
  when that fails; vitest-bridle had no way, so the vendored
  `tools/vitest-bridle` was patched (an error with `skipScenario: true`
  calls `ctx.skip(reason)`) and now differs from bridle's. The slow setup
  also needed the spec timeout raised to 60s. From mu-hxvt. Bridle: br-s4ve.
