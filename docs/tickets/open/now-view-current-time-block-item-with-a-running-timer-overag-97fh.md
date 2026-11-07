---
id: mu-97fh
title: "Now view: current Time Block item with a running timer, overage, previous and next, and a Done button"
kind: feature
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
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
