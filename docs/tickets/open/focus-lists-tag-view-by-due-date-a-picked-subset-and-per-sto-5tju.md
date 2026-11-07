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

Source notes (aide on notes, m-0112, 2026-11-07): the human's requirements draft from the
2026-10-31 Lowe's + Walmart trips is `area/meta-notes/UI Shopping List.md` in the notes repo;
store layouts are in `resource/locations/Muncie.md`. The multi-step-in-a-place idea is in
`area/meta-notes/UI Now Screen.md`.

For the multi-step-in-a-place idea (meta-notes aide, m-0113): meta-notes tickets mn-5zm3
(context-aware nudges), mn-5wam (live view origin), mn-nm28 (learn how long things take); shipped
CLI pieces: checkin, task trees (`task show --tree`, `task add --under`), Time Log `* note:` lines.
Also the notes root's `project/life-app`, the human's own plan for the app.

## More from the human (Sat 2026-11-07, to aide, verbatim)

"I'll pull from this list. I have a master list of things I might want to get in any of these
stores, and then I'm going to say, "Hey, I'm going to Walmart." Let's make a list for Walmart, and
then I want to see exactly a list of things in Walmart.

I want it to look and work similarly to the Reminders app on iPhone. For the shopping list, I'd
like it to be organized, or at least organizable, into buckets and groups. For example:

* Bread stuffs go together.
* International foods are in an aisle.
* Soft drinks and chips are nearby.
* Dairies together.

 At a minimum, we want to be able to group things by store location, and I would use that kind of
grouping for other stores. If there's no grouping, a flat list is also fine.

I want to check things off as I get them, of course. What happens when it's checked off is
something I'm not sure about, but I think it should disappear from the current list so I can see
exactly what's left to get. I do want to maybe have it so that, if you scroll down to the bottom,
there's a list of things I've already gotten. That list would contain all the things I've checked
off.

I should be able to uncheck something. For example, maybe I grabbed the buns up front, but then
when I got to the back of the store, I realized I got the wrong kind of buns or something. I should
be able to scroll to the bottom, see where the buns were, and uncheck them to remind myself to get
the buns again."

## More from the human (Sat 2026-11-07, to aide, verbatim)

"And this is a different UI. Just to be clear, this is a whole different page within the current
UI, a whole different screen experience. I've brought this up before. I don't know where we got
with it, but we should add tab control along the bottom for mobile, right? This should be, I said
it, different tabs across the bottom, and we've got some sort of control at the top for the Today
node and a few other things.

For now, we could leave all that just as it is in Home, but then we need a different page at the
bottom for shopping lists or lists or something like that. From within there, there would be this
set of lists of things, and it should always know the current thing. If I just open that up, it
should open the current thing. If I haven't opened it recently, that should be metadata that
should be noted in the repo somewhere, which is the current list, because that's part of the daily
note. The app itself should also remember what I was looking at, right? When it opens, by default,
it would go to the current thing if there should be an active shopping list type of thing. That's
how you get to this interface.

Also, at the upper left, it should have a button that takes you back to the list of all shopping
lists. That would contain all the different shopping lists that I've created and have controls to
create new lists and modify them.

The way that this should work is undetermined. The way this data should be stored in the notes
database, the notes file system, is not yet determined. That's probably one of the main things
we're going to have to work out because currently tasks are spread all over the repo. That's an
acceptable structure, but we may need to have a different structure somewhere to store this
information. These lists should all be stored somehow as plain text within the notes repository."

Aide: no ticket for the bottom tab bar existed before this (it is in the notes repo's
`area/meta-notes/UI Now Screen.md`, 2026-10-10 and 2026-10-15, never ticketed here).

## More from the human (Sat 2026-11-07, to aide, verbatim): agent first

"If I'm using the user interface only, then I'm not sure how this works, but it's kind of
difficult. The easier thing to solve first is that list creation or the list filling goes through
the agent. That way, we can kind of iterate more easily on the design.

What I would do is talk to the aide at Notes and say, "I'm going to Walmart. Make me a list for
this trip to Walmart." That agent needs to have instructions on how to do this as part of that
repository's instructions. Those instructions on how to make a list should come from the meta-notes
plugin, because the notes repo is just an instance of meta-notes. The meta-notes CLI should have
commands for creating and managing these lists.

The agent, or I in the first version, will be able to use the CLI for anything, and then we can
figure out how to do this strictly from the UI later."

## More from the human (Sat 2026-11-07, to aide, verbatim): tabs now, message from the list

"I want to keep shaping this and working on the design for a little while. You asked, "When I'm
done with the store, what happens?" Yes, if I'm done with the store trip, anything I didn't get
stays unchecked in the master list, and anything that I did finish off obviously gets checked off
in the master list. 

So sorry. The UI bottom tabs come now in the UI, but what I mean is that list management (such as
creating lists, adding and removing things from lists), some of that could be done from the CLI
for now. There are some other things here.

From within the UI, I need to be able to do two things:

1. Send a message. We have that. We have a button for that on the other side, in the other app,
but I need a one-tap way to send a message to the agent, to the aide at Notes, while I'm in the
shopping list UI. We'll work on how that works exactly, but it should be as low friction as
possible for that.
2. Through that interface, I can pretty easily add things to the list and chat with the agent."

Aide: the storage choice (mn-yznt, A/B/C) is not decided; the human is still shaping the design.

From the human (Sat 2026-11-07, to aide, verbatim), on the one-tap message from the Lists tab
(aide had offered a chat box with replies, or tap-to-talk): "Generally, I don't need the agent's
reply to show up. I'm sending a message as fire-and-forget. In this instance, if I need to actually
chat with the agent, I'll use remote control."
