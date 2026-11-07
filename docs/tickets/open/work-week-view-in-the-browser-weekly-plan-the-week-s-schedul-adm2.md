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
