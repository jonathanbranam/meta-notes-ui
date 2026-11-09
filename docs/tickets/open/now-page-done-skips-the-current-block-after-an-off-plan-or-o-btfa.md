---
id: mu-btfa
title: "Now page: Done skips the current block after an off-plan or overrun entry"
kind: bug
created: 2026-11-09
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

From the human (2026-11-09, to aide, verbatim):

"bug with Now page: I clicked DONE on an entry that didn't match the plan I think and then it skipped the current block and moved to the following block. IDK how to describe better, but it definitely did not work right.

I think I had run over time for the current block and the done didn't do the right thing; please investigate the behavior and fix it"

## Cause (aide, from reading client/src/now.ts; not run, and the human's actual Time Log was not available)

`nowState` picks the entry's block by matching its name to a Plan, else by the block its start time falls in. It then treats the block after that as `next`, and Done starts `next`. The clock is not consulted. With blocks A 9:00-10:00, B 10:00-11:00, C 11:00-12:00:

1. **Off-plan entry inside a block.** "call" starts 10:20, inside B. Done at 10:40: `at` is B, so `next` is C. C starts at 10:40 and the rest of B is skipped. Most likely what the human saw.
2. **Entry started in a gap, or before the first block**, and run into a block. No block contains its start, so line 72 uses the first block with `start > nowMin`, the one after the block on the clock. Same skip.
3. **On-plan entry run past a whole block.** A runs until 11:30. Done starts B, though the clock is in C. This is the opposite error: it starts a block whose time has passed.

Plans often repeat a name ("work", a meeting, "work"), and entries often name a block loosely ("interview" against a Plan of "work: interview ..."), so non-matches are common.

## Fix

Done starts the block planned on the clock now, unless that is the block the entry itself matched by name. Then it starts the block after it. With no block on the clock, it starts the next one to come. The "Next:" line, the Done message and the write must all use the same answer.

Case 3 changes behavior: B is passed over because its time is gone. Spec r-d27a in design/specs/now.md needs updating.

Also look at overage for an off-plan entry: it is measured against the block the entry started in, which may mislead.

## Check

Unit tests for cases 1-3, for an entry named after a block overrunning slightly into the next (still starts that next block, as today), and for a repeated Plan name. Existing Now specs stay green.
