---
id: mu-adm2
title: "Work week view in the browser: weekly plan, the week's schedule, and what I worked on each day"
kind: epic
created: 2026-11-07
created_by: external:aide
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: [mu-5tju]
---

## The ask

From the human (Sat 2026-11-07, to aide, verbatim): "The second big topic is different completely,
and it's for a better view in the UI to use at work in a browser for viewing:

* my weekly plan
* my weekly schedule in advance and as it gets filled in
* what I worked on each day, both by viewing the time block and the time log in a prettier and
  easier web UI"

Context (aide): the notes root on vesta is in personal mode; meta-notes ticket mn-5wam ("web app at
work and mobile app for personal") is the origin of this ask. Week plans are
`plan/week/<YY-Qn>/<monday>.md`; each day's Time Block and Time Log are in the daily note. Design
open; questions for the human on the thread.

From the human (Sat 2026-11-07, to aide, verbatim): "The UI changes between desktop and mobile are going to be pretty significant. I don't have anything significantly different yet, but I don't really want a tab bar along the bottom in the browser."
(Aide: the bottom tab bar is for mobile only; desktop gets its own navigation, not yet designed.)

From the human (Sat 2026-11-07, to aide, verbatim): "Ask me the questions for the work week view,
and this should work as well as at home. I'm specifically doing this at work, so it should be
configurable as either 7-day, 5-day, or 2-day for the weekend. Those would be the defaults: 7, 5,
like 7 weekdays and weekend."
(Aide: works on any notes root, work or personal; day ranges: 7 days, 5 weekdays, 2-day weekend.)

Aide's questions: (1) a calendar-style grid, a column per day, Time Block blocks as boxes, plus
calendar events when an export exists; (2) future hours show the plan, past hours what happened
(Actual + Time Log) with the plan faint behind; (3) the week note's Goals and Plan collapsible at
the top. On (2), the human (verbatim): "Let's simplify number two: anything that's in the past,
don't show the plan." (1) and (3) not yet answered.
On (1), calendar events, the human (verbatim): "Any period with a time block in plan would supersede
anything on the calendar. Anything without a daily note or with no time block entered for that
15-minute period should show what's in the calendar."

Aide asked: a past slot with nothing in Actual or the Time Log: blank, or the calendar event faint?
The human (verbatim): "Good callout. For something in the past with nothing in actual and no time
log, follow the same decision logic, but indicate it because it's in the past. I wanted to see it
rendered in a different style or have an icon associated with it to make it clear that this is not
a record of what happened, but rather a fill-in from the calendar.

Something else to note is that the time log for today or even yesterday sometimes has errors in it.
The parsing and display should be resilient to kinds of errors like two starts in the same time
log, a start without an end, or two ends. It should figure out where those errors are, but show
everything else normally.

Blocks that have an error in them should show, again, in a different style and indicate error
parsing with a really brief description, like missing start, missing end, duplicate starts,
duplicate ends, or something very simple like that. Usually, there'll be a few of those scattered
throughout the day, and the later parts of the day will be filled in, and some of the earlier parts
will be missing."

The human (verbatim), clarifying "the same decision logic": "Right, when I said the same decision
logic, what I mean is, for each 15-minute block, we check. There's a cascading order of what we
check, and the cascading order should be written once, defined once, and used everywhere. The way
that gets treated in the UI could be different and will be different between future days and past
days, but I think the ordering should be the same for both. 

And it's unlikely, but we should also handle the case where there's a time log or an actual in the
future. That should get a different kind of error UI treatment as well. I don't know how that would
happen, but you never know. Software has bugs."

Aide's reading (to confirm with the human): one cascade per 15-minute slot, defined once:
Time Log > Actual > Plan > Calendar > empty. Past: Time Log/Actual are records; Plan/Calendar are
fill-ins (marked style + icon). Future: Plan/Calendar normal; a Time Log or Actual in the future is
an error (its own error style).

The human (Sat 2026-11-07, verbatim), on the cascade: "Okay, let's work through this a little.

1. Time log: Time log is the single authoritative list of exactly what I did. That's what I really
want to see. The actual block is really just a summary for that block.

 If I'm looking at my week and it's Wednesday (it's hump day), at the end of the day on Wednesday,
I'm trying to plan my week. I'm trying to write some notes about what happened. I want to see
Monday and Tuesday, and every part of Wednesday before now. Call it 4 pm on Wednesday. Everything up
until 4 pm on Wednesday should show the time log. That's what should appear.

Everything after 4 pm on Wednesday should show the time block for Wednesday because that should
already be there. For Thursday and Friday, it would show, in order, the time block if it exists. If
not, then it should show any calendar events, and I think it should show tasks that are due on that
date somewhere. It's probably collapsible, but I want to see tasks that are due on that date. That
could possibly be a different UI or something like a collapsible, hideable block on this UI,
because I'm not exactly sure how to combine those two things. I would love to see that as well.

The idea is I'm trying to plan Thursday and Friday. I want to see what I've already scheduled for
those days, as well as my calendar. If, let's say, I've blocked out Thursday already, I want to see
that. For Friday, let's say there's no daily note, I would just want to see my calendar plus the
tasks in a collapsible block somewhere."

Aide asked, before now with no Time Log entry: A = Actual, then Plan, then Calendar as fill-ins;
B = Plan then Calendar only. The human (verbatim): "Yes. When there's no time log entry, we fall
back to actual, then we fall back to the plan, and then the calendar. Agreed.

There's just one style for that. If there's no time log, there's just one style. There should be a
very small icon of some kind, or a single-letter indicator, or a two-letter indicator of the source
of that. By default, we don't show the source because, by default, the source is in the past time
log. If there's no time log, then we should show some sort of indicator of where this content came
from.

Same for the future. The default source is the time block, but we would show anything that came
from the calendar as a different style. I think that is a different style as well, but it should
probably indicate where it comes from. I think, also, not exactly sure, but yeah, I think A is
basically correct."

### Agreed so far (aide's summary)

One cascade per 15-minute slot, defined once:
- Before now: Time Log (default, no badge) > Actual > Plan > Calendar > empty. Non-Time-Log sources
  share one fill-in style plus a tiny source badge (e.g. A, P, Cal).
- After now: Time Block plan (default, no badge) > Calendar (own style + badge) > empty.
- Errors: Time Log parse errors (missing start/end, duplicate starts/ends) in an error style with a
  short label, the rest of the day shown normally; a Time Log or Actual in the future is its own
  error style.
- Tasks due each day: a collapsible list at the top of each day's column.
- Ranges: 7 days, 5 weekdays, 2-day weekend; works on work and personal notes roots; desktop browser
  first, live updates assumed like the rest of the UI.
Open: the week note's Goals/Plan at the top (asked, not answered).

## Go-ahead

The human (Sat 2026-11-07, verbatim): "Yeah, I don't know. I don't think goals and plans need to be
in this UI. Let's say no for now. And I approve the rest of it. Let's go ahead and start building
this, and as I work on it and see how it works, I'll have further feedback."
So: no week-note Goals/Plan in this view; everything in "Agreed so far" above is approved.
