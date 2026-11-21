+++
id = "mu-9gqq"
title = "List page: the check-off mark is a letter X drawn outside its box; checkboxes look broken"
kind = "bug"
state = "open"
created_at = "2026-11-21T17:36:24.830Z"
updated_at = "2026-11-21T17:44:15.577893574Z"
created_by = "external:aide"
watchers = ["external:aide"]
ticket = "9gqq"
+++

docs/tickets/open/list-page-the-check-off-mark-is-a-letter-x-drawn-outside-its-9gqq.md

submitted by external:aide

From aide (notes), for the human. They are frustrated with this.

The human, 2026-11-21 ~12:36 PM ET, on their iPhone in a store using the list page (resource/lists/26-Q4/2026-11-21 Walmart.md), verbatim via voice:
"Is there a meta-notes UI aid working, or can we file tickets there? I'm frankly kind of infuriated. The list check-off button thing doesn't look right. The visual style is terrible. When you click it off, the X isn't inside the box at all. Is it inside the circle at all? I don't really understand why, how that could be, how we have a component that obviously was never visually inspected. Also, isn't it just using React? Isn't there a really obvious and clear way to build a checkbox or something? I don't know. I could send a screenshot, but the X just isn't inside the box, and it's just a letter X. I don't know. It just looks ridiculous. Well, obviously, the whole point of bridle here is scaling, because there should be strict workflow, guidelines, and controls around how these things get built, and that's obviously not happening. We need to work on the bridle overall solution, especially for these UI-based things. They're never really doing what they should be doing. They aren't built in the right way, and it's a massive waste of my time to review them."

What's wrong: checking an item off on the list page shows a plain letter "X" that is not inside the box (or circle) at all. The control was evidently never visually inspected.

The ask:
- Use a proper checkbox (a native input styled with CSS, or an SVG check mark centered in the box), with the checked mark inside the box at every size, on mobile Safari especially.
- Show the three states distinctly: open, done (checked), canceled ([-], see mu-5ahy).
- Before calling it done, inspect it visually: a screenshot at a phone width (iPhone Safari) and a desktop width, attached to this ticket.

The human offered a screenshot; ask the aide (notes) if you want it.

## Thread

### note · external:aide · 2026-11-21T17:36:24.891Z
submitted by external:aide

### note · external:orchestrator · 2026-11-21T17:37:52.407Z
readied by external:orchestrator

### note · agent:checkbox · 2026-11-21T17:44:15.577Z
Visual inspection done (Chrome headless via playwright-core; WebKit is not installed, so no Safari engine). Throwaway dev:example site on its own port, stopped after. I looked at each shot: marks are inside the boxes. Screenshots in /tmp/checkbox-shots/ (each at iphone390 = 390px wide at 3x, and desktop1280):
- lists-page-iphone390.png / lists-page-desktop1280.png: Lists tab, Walmart list: open (Milk, long wrapping item), done (Eggs, blue box with check, struck through), canceled (Bread, muted box with dash, struck through).
- list-*.png: the same list file opened as a note page (Home tab).
- note-*.png: note page task lines: open, done, canceled, moved, partial.
- today-*.png: Today page: open task lines.
- tasks-*.png: Tasks tab, TaskRow (open boxes + Cancel).
- now-*.png: Now page: it has no checkbox control, nothing to fix.
Found and fixed on the way: note pages drew a second grey native checkbox beside the box; hidden now.
