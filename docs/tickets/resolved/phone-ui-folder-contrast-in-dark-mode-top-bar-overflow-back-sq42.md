---
id: sq42
title: "Phone UI: folder contrast in dark mode, top bar overflow, back/forward, bigger checkboxes"
kind: bug
opened: 2026-10-08
repos: [meta-notes-ui]
changes: []
specs: []
needs: []
see: []
tasks: [mu-sq42]
closed: 2026-10-08T22:50:28Z
---

## The ask

From the human, via aide, 2026-10-08, verbatim, using the always-on server as a PWA on the phone:

"Overall, it's pretty nice, but the folders: I'm using, I guess, dark mode. I don't know. It's coming out black, which is great. I'm fine with that, but the font for the folder names is kind of gray, and it's much too hard to see. That needs to have better contrast.
The top bar doesn't work quite right when the name of the file that's open is long. There are sizing issues: it stretches the viewport on mobile so that it overflows and requires horizontal scrolling, and we don't want that. Maybe there are a couple solutions, but maybe just move the file name down one so that the buttons at the top are always there and sized consistently. Move the file name down and make sure it's clipped at the edges and doesn't increase the size of the viewport. I'd like a back button, so that'll give us room at the top. Maybe just back and forwards. There's no back button in a PWA. I don't know if you can detect if it's a PWA and do it only for the back button then, but I'll use it as a PWA, and it definitely needs a back button. [...] The checkboxes could be a little bit bigger, but that's not a huge problem"

## The ask

- Dark mode: folder names in the tree have too little contrast (gray on black); make them clearly readable.
- Top bar: a long open-file name must never widen the page or cause horizontal scrolling on mobile. The buttons stay on the top row, fixed size; the file name moves to its own row below and is clipped/ellipsized at the edges.
- Back and forward buttons in the top bar (browser history), since an installed PWA has no back button. Showing them only in standalone mode (`display-mode: standalone`) is fine if it's simple; the human uses it as a PWA either way.
- Checkboxes a little bigger (minor).
