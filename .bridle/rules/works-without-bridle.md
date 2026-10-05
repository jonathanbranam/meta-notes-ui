---
id: works-without-bridle
severity: must
roles: [manager, worker]
---
The human runs this UI at work, where they can't and won't run bridle.
What it ships needs only a clone of this repo, `npm ci` and `npm run
build`, Node, and a meta-notes checkout with `meta-notes` on PATH. No
`bridle` commands or `.bridle/` files at runtime; only public npm
packages.

Why: the human, 2026-10-04: "I can git pull and clone public GitHub
projects and I can NPM install public projects. KISS would be a clone."
