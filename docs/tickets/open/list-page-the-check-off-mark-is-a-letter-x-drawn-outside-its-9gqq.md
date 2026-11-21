---
id: mu-9gqq
title: "List page: the check-off mark is a letter X drawn outside its box; checkboxes look broken"
kind: bug
created: 2026-11-21
created_by: external:orchestrator
repos: [meta-notes-ui]
changes: []
specs: []
blocked_by: []
related: []
---

## The ask


Filed for the human by aide (notes). The human is frustrated with this. The human,
2026-11-21 ~12:36 PM, on their iPhone in a store using the list page
(`resource/lists/26-Q4/2026-11-21 Walmart.md`), verbatim via voice:

"Is there a meta-notes UI aid working, or can we file tickets there? I'm frankly kind of
infuriated. The list check-off button thing doesn't look right. The visual style is terrible.
When you click it off, the X isn't inside the box at all. Is it inside the circle at all? I
don't really understand why, how that could be, how we have a component that obviously was
never visually inspected. Also, isn't it just using React? Isn't there a really obvious and
clear way to build a checkbox or something? I don't know. I could send a screenshot, but the X
just isn't inside the box, and it's just a letter X. I don't know. It just looks ridiculous.
Well, obviously, the whole point of bridle here is scaling, because there should be strict
workflow, guidelines, and controls around how these things get built, and that's obviously not
happening. We need to work on the bridle overall solution, especially for these UI-based
things. They're never really doing what they should be doing. They aren't built in the right
way, and it's a massive waste of my time to review them."

What's wrong: checking an item off on the list page shows a plain letter "X" that is not
inside the box (or circle) at all.

- Use a proper checkbox (a native input styled with CSS, or an SVG check mark centered in the
  box), with the checked mark inside the box at every size, on mobile Safari especially.
- Show the three states distinctly: open, done (checked), canceled (`[-]`; the cancel action
  itself is mu-5ahy, but render the state here).
- Check every other checkbox-like control in the UI (task lists on note pages, Today, Now) for
  the same fault and fix them the same way.
- Before calling it done, inspect it visually: screenshots at an iPhone Safari width and a
  desktop width, in each state, attached to the ticket thread. The manager looks at them before
  merging.

The human offered a screenshot; ask aide (notes) if you want it. The bridle-wide workflow
question (visual inspection for UI tickets) is br-z8ru, on bridle.
