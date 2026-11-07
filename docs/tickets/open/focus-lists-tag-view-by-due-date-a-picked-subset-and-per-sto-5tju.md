---
id: mu-5tju
title: "Focus lists: tag view by due date, a picked subset, and per-store shopping lists"
kind: epic
created: 2026-10-17
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask

From the human (Sat 2026-10-17 11:36 AM ET, verbatim, relayed by aide on notes, m-0103):
"Just to clarify what I want in the Notes app, too: the online thing was one thing that I wanted.
This is going to be a little more complicated, possibly. There's the online thing: I'm at my
computer. What are my tasks to do online right now? There may be tasks that are overdue or not. In
some cases, I might want to see everything that's done with a given tag. There's a situation where
I'm sitting down, I've decided these are the five things I'm doing out of the eight that need to be
done, and I really only want to see those five. That's where I think we find some combination of
tags or a file, or tags and due dates maybe, that will work for that. Similarly, I'm about to go to
Walmart. I want a shopping list. I want a Walmart shopping list, right? I want a list of exactly
what I'm getting at Walmart right now: things that I've decided to get today."

Context (aide): today the Walmart list is a parent task with subtasks in the daily note
(plan/daily/26-Q4/2026-10-17 Sat.md, line 14); errands are scattered as undated tasks across notes
(some #hardware-store). Builds on the tag task view (mu-x6nb, v0.22.0).

## Asks

1. Tag view filtered by due: due today / overdue / all, with an option to include done tasks.
2. Pick a subset ("the five I'm doing now out of eight") and see only those.
3. A per-store shopping list of what's decided for today.

## Design (open; orchestrator's proposal, not yet approved)

One mechanism for all three: a focus list is a tag plus a due filter, shown in the tag view.

- (1) Filters on the tag view: `due: today+overdue | all`, `include done`. URL carries them
  (e.g. `#tag/online?due=today`) so each list is bookmarkable.
- (2) Picking = giving the chosen tasks a due date of today (or a session tag such as `#now`),
  then opening the view with `due=today`. No new storage; the notes stay the source of truth.
- (3) Store lists = a tag per store (`#walmart`, `#hardware-store`) on the items; "decided for
  today" = due today. The Walmart list is `#tag/walmart?due=today`. Subtasks under a parent task
  in the daily note would need the parent's tag to count for its children (to decide).

Rejected for now: a separate list file or picked-list storage in the UI (a second source of truth
beside the notes); multi-tag boolean queries (add only if one tag + due isn't enough).

Open questions for the human: (a) pick by due-today or by a `#now` tag? (b) should subtasks inherit
the parent's tag? (c) does "decided to get today" mean due today, or something else?

Split into child tickets once the design is agreed.

## More from the human (Sat 2026-11-07, to aide on meta-notes-ui, verbatim)

"There are two major topics. The first one is for the UI that I use on my phone. This would work.
All this should work in the browser as well, very similarly, but there are some things that I do
commonly on my phone, which would be the design priority.

For this, I guess there are two subpoints here:

* A shopping list or a to-do list for a specific time or event. I do want it to be a little more
  flexible than just a shopping list, but also, in terms of shopping, we might have a specific
  implementation that is designed for shopping specifically. One of the things for shopping in
  particular is that the store has a layout, and I would like to try to group things based on the
  store layout. That's unique for shopping.
* The overall generic concept that I want to have built is that I'm doing a task. I'm in a place
  doing a thing, and that thing has multiple steps. There should be a brief on this. Actually, you
  can ask either MetaNotes Aid and/or a note on Aid on the notes project for a better brief,
  because I think both of them might have this. I'll try to get that sent over as well.

Okay, let's go just with the shopping list idea to start with. For the shopping list, I have a
bunch of things on a list to get at Walmart or Lowe's. Some things can be purchased at either
store, so that's something that I want to retain in this solution.

Also, I don't always know in advance which thing I'm going to get where. In this case, those two
stores are right next to each other in Muncie. Even if they're not, sometimes I go on a shopping
trip, and I might go to Walmart, Target, Lowe's, and Meijer, or something like that. Or we might go
to Kohl's and Target for shopping because they're nearby. There's a list of things I want to get."
