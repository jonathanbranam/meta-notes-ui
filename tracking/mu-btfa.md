+++
id = "mu-btfa"
title = "Now page: Done skips the current block after an off-plan or overrun entry"
kind = "bug"
state = "planned"
created_at = "2026-11-09T18:14:44.195Z"
updated_at = "2026-11-09T18:54:51.677263594Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "btfa"
+++

docs/tickets/open/now-page-done-skips-the-current-block-after-an-off-plan-or-o-btfa.md

## Thread

### note · external:aide · 2026-11-09T18:15:29.358Z
From the human (2026-11-09, to aide, verbatim), told the three cases and that an off-plan entry inside a block was the most likely: "that sounds like the same issue"
They did not object to the case 3 behavior change, but were not asked about it directly and did not address it.

### note · external:orchestrator · 2026-11-09T18:16:09.785Z
Planning notes (orchestrator). Approval: the human, via aide (m-0277), verbatim: "please investigate the behavior and fix it". Full quote on the ticket. It blocks a daily workflow, so it goes ahead of other pending work.

Model: Sonnet (time and block logic where the three outputs must agree).

Investigate first: aide's cause comes from reading client/src/now.ts without running it, and the human's real Time Log was not available. Write the unit tests for cases 1-3 first and confirm they fail on current code the way the ticket says. If the behavior differs, say so on this thread before changing the rule.

Impact list: client/src/now.ts, client/src/now.test.ts, the Now page component only if it computes any of this itself, design/specs/now.md (r-d27a and its scenarios; `bridle spec id` for new headings), package.json version (PATCH), README status line, CHANGELOG if the project keeps one.

Rule to build: the ticket's Fix section. Done starts the block planned on the clock now, unless that is the block the entry itself matched by name, then the block after it. With no block on the clock, the next one to come. The "Next:" line, the Done message and the write must use one shared answer.

Behavior change, intended and approved through aide's note: an on-plan entry that overran a whole block now starts the block on the clock, passing over the block whose time has gone (case 3).

Overage for an off-plan entry: look at it as the ticket asks. If the right number is a small change in the same function, fix it and test it. Otherwise leave it and describe it on this thread.

Verify: the project's normal check is green, once (s-4d43 skipped is expected). Unit tests for cases 1-3, for an entry named after a block overrunning slightly into the next (still starts that next block), and for a repeated Plan name. Existing Now specs stay green, apart from r-d27a's intended update.

Deferred: any change to the Time Block Actual column or to how Plans are matched by name, not yet because the human asked only about what Done starts.

Rejected: keeping "the block after the entry's block" and special-casing off-plan entries (case 3 would still start a block whose time has passed).

### note · external:orchestrator · 2026-11-09T18:26:42.590Z
Correction to my planning notes (orchestrator): I wrote that case 3 was 'intended and approved through aide's note'. That overstates it. Per aide's comment of 18:15 UTC, the human was told the three cases and said "that sounds like the same issue", but was not asked about the case 3 change directly and did not address it. Build it as planned: it is the ticket's Fix and the human's report mentions running over the block. Keep case 3 a small, separable part of the rule, and say plainly in the merge report what it changes, so it can be put to the human at ship time and undone cheaply if they object.

### note · agent:done-skip · 2026-11-09T18:54:51.677Z
Done on bridle/done-skip. Cases 1-3, the repeated-name and the slight-overrun tests were written first; on the old code cases 1, 2, 3, 'nothing on the clock', repeated name and the off-plan overage test fail, slight overrun and on-time pass, as the ticket says. Overage: small fix in the same function: an off-plan entry has no block of its own, so its 'block' is the one on the clock (never over), instead of the block it started in. Case 3 is isolated in nowState: the 'clockAt === matchedAt ? clockAt + 1 : clockAt' choice; replacing it with 'matchedAt + 1' when matchedAt >= 0 undoes it.
