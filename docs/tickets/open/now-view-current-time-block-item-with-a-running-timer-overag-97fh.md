---
id: mu-97fh
title: "Now view: current Time Block item with a running timer, overage, previous and next, and a Done button"
kind: feature
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: [mu-5eme]
related: [mu-ma6v, mu-adm2, mu-5eme]
---

## The ask

From the human (Sat 2026-11-07, to aide, verbatim): "Yeah, there's another big thing here, and this
would exist in both the browser and the mobile version. Similarly, that is a view of the time block
where it shows:

* the current thing that I said that I'm working on
* a timer showing how long I've been working on it and when I started
* the previous thing, just one line of the previous thing I finished, probably coming from the time
  log
* what I should be doing next from the time block

 This is going to be complicated to figure out exactly how this thing works, but what I'm aiming
for is a user interface that shows what I'm currently doing and when it started. It has a log of
the time, like a chrono time log thing. I can hit Done, and if I hit Done, that would record in the
time log that I'm done at that exact moment. It should then switch to the next thing in the time
block that I'm scheduled to do and immediately start that.

That's the basic idea. Changing what I'm doing and editing things is all future work that we're
going to de-scope for now. I would use this at work as well as at home.

It should also show overage, for example, by turning a different color, like red or something, if
I'm running over time. It should show separately both the amount of time I've worked on something
(ever increasing) and the overage time. I should always be able to see what's coming next. I think
scrolling down would show the rest of the time block. If I scroll below this (scroll up on the
screen), I should be able to see the rest of the time block for the day."

Context (aide): this is the "Now" screen from the human's notes, `area/meta-notes/UI Now Screen.md`
(2026-10-10, 2026-10-15) in the notes repo. Related: meta-notes mn-5zm3 (context-aware nudges), the
checkin skill (`meta-notes checkin`, fills the Time Block Actual), `meta-notes time-log append`.
Related here: mu-ma6v (trip timer, Left/Arrived buttons writing the Time Log). Out of scope now, per
the human: changing what I'm doing, editing. Design open; questions on the thread.

## Decisions (Sat 2026-11-07, via aide)

Aide's questions: (1) overage: A = over at the block's planned end on the clock, B = over after the
planned length counted from my start; (2) with nothing running, show the current block with a big
Start button, then Done chains block to block; (3) Done writes only the Time Log for now, not the
Time Block's Actual cells.

The human (verbatim): "Red means you're behind schedule. That would be A from your list. I agree
with point 2, and yes, I agree with point 3. I think when I'm done with something, it should send a
message to the aide at notes, as well as filling in the time log itself."

So: blocks = consecutive Time Block rows with the same Plan; overage from the block's planned end;
Start button when nothing runs; Done appends the Time Log entry (start/end) and starts the next
block at once; Done also sends a message to `external:aide` on notes (same message path as the
Message button); Actual column untouched for now.

From the human (Sat 2026-11-07, to aide, verbatim), asked where Now lives: "Yes, it's a new bottom
tab next to Home and Lists. This is how I want to manage the basics of trip timing. I think I want
to be able to say, "hit this in the morning," at the exact minute I'm leaving from the house, and
then I could hit it again when I arrive at work.

There's nothing else fancy here. Don't do anything else special for tracking driving, but this
should be a way to track that.

What else? This user interface needs to respond to changes in both the time log and the time block.
It needs to be file system-aware, observing those changes and making updates live."

(Aide: so the Now tab replaces the separate trip timer design in mu-ma6v: Start/Done on the
"Drive to work" block is the trip timing. In the desktop browser, Now is a page, no tab bar.)

## Go-ahead

Aide asked whether to send the Now tab to the orchestrator to build. The human (Sat 2026-11-07,
verbatim): "Yes, and this Now tab should be the first one on the left." Tab order on mobile: Now,
Home, Lists.

## Brief (orchestrator, 2026-11-07)

Approval: the human's go above ("Yes, and this Now tab should be the first one on the left."), relayed by aide m-0187.

Build the Now view as decided above. Read the Time Block and Time Log through the meta-notes CLI the server already uses (`meta-notes` time-block/time-log commands; Done writes with `meta-notes time-log append`), never by hand-parsing notes. Live updates: re-read when the daily note's Time Log or Time Block changes (reuse the server's existing file watching/push if it has one). Done's message goes through the same server path as the Message button (to `--bridle-to`, external:aide), text like "Done: Drive to work, 7:50-8:04 (4 min over). Now: work, until 10:00."

Where: the first tab on mobile (order Now, Home, Lists; the tab bar comes from mu-5eme, so this is blocked by it); a page in the desktop browser, no tab bar.

Acceptance: tests with fixture daily notes for block grouping (consecutive rows, same Plan), timer and overage from the planned end, Start with nothing running, Done appending exactly one Time Log entry and starting the next block, the message text, and a live refresh after a file change. Repo check green once; mobile screenshot on the ticket.

Model: Sonnet.

Out of scope (not yet): changing or editing what's running, writing the Time Block Actual column, anything special for driving (mu-ma6v superseded).
