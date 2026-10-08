---
id: cbbm
title: Re-render note sections richly in the UI (the Outlook as a chart, tables)
kind: explore
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: []
---

## The ask

The human, 2026-10-08 (to the meta-notes aide, while settling the
meta-notes `outlook` command, meta-notes ticket pqwv, which writes a
`### Outlook` section with a temperature sparkline into daily notes):

> In the UI, we could work on that later, but I think we should take some
> of these things and re-render them when it hits the UI. I don't know how
> we do that exactly, whether we just make another call to the
> temperature and replace it, or if we try to reinterpret what's in the
> file. You can file that as a future idea.
>
> I do like to see proper tables and charts and things like that. I use
> Mermaid at work, but I don't think I'll use it in my daily notes ever.
> Trying to think of what else to visualize.

A future idea, not ready for work. Two ways the human named: fetch fresh
data (e.g. `meta-notes outlook --json`) and render it, or interpret the
lines already in the note (the Outlook lines have a fixed format) and
draw them as a real chart. Other candidates for richer rendering are open
("trying to think of what else to visualize"). Needs a conversation with
the human before a design; depends on pqwv shipping.
