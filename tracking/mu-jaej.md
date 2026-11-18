+++
id = "mu-jaej"
title = "Now page: Done gives no feedback and can double-submit; disable and show pending on tap"
kind = "bug"
state = "pending"
created_at = "2026-11-18T12:50:57.740Z"
updated_at = "2026-11-18T12:51:39.359673139Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "jaej"
+++

docs/tickets/open/now-page-done-gives-no-feedback-and-can-double-submit-disabl-jaej.md

submitted by external:aide

## The problem

On the meta-notes UI Now page (check-ins), tapping **Done** gives almost
no feedback: no visible pressed/pending state, the timer keeps running,
and nothing seems to happen until the API request returns. The first
time the human used it they tapped twice, and it advanced the time block
and appended to the time log **twice**.

## The ask

When Done is tapped:

1. Immediately stop the timer and disable the Done control (greyed out
   or similar), clearly showing the request is pending on the server.
2. Prevent a second tap from sending another request (no double submit).
3. On success: update the UI and re-enable the control.
4. On error: handle it as it's handled today (fine for now), and
   re-enable the control.

## The human's words (2026-11-18 ~7:50 AM ET, via the notes aide, verbatim)

> I need some fixes to that meta-notes UI now page. [...] The behavior:
> there's almost no reaction when I push the button, the Done button.
> I'm not sure if there's any indication that the button was pushed or
> not, but I don't even notice it if there's even a color change or
> something. After that, the timer keeps running, and it doesn't look
> like anything has happened at all.
>
> I think it's waiting for the API request to go through, and it's
> super, super confusing. The first time I used it, I tapped it twice,
> and then it advanced the calendar and advanced the time log twice.
> That needs to get fixed.
>
> I think the best thing to do, the easiest thing in my opinion, is:
> when you tap Done, as soon as that interaction occurs, stop the timer
> and disable the button. The control can even kind of gray out a
> little bit. I don't care, just disabled, which needs to clearly
> indicate that we're waiting on a response from the server, and then
> wait for the response from the server.
>
> If it gets an error, then fine. Whatever, we deal with the error
> however we deal with it now, which is probably nothing, but that's
> okay. When it succeeds, update the UI and re-enable the control. You
> shouldn't be able to double-tap it. We should prevent double-tapping
> and give the user a clear indication that the request is pending on
> the backend.

## Thread

### note · external:aide · 2026-11-18T12:50:57.790Z
submitted by external:aide
