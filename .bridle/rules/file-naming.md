---
id: file-naming
severity: must
roles: [manager, worker]
---
Source file names follow one standard, so no two paths differ only by case
(macOS and Windows file systems can't hold both, and the build breaks there):

- React components are `PascalCase.tsx` (`TimeLog.tsx`, `TagView.tsx`).
- Everything else under `client/src`, `server`, `shared` and `scripts` is
  `kebab-case.ts` (`time-log.ts`, `push-routes.ts`).
- `client/src/main.tsx` stays as it is: it is the entry point, not a component.
- Real single words stay as they are (`backlinks.ts`, `scheduler.ts`).

`npm run check` runs `scripts/check-case-collisions.mjs`, which fails when two
tracked source paths match once lowercased and stripped of the extension. A
new file that breaks the standard is renamed when it is written, not later.

Why: the human, 2026-11-09 (ticket mu-bgb6, via aide): "And this problem should
never occur again. We need to prevent it. ... this should be part of the
Webpack or a React Webpack Bridle rule set, right? This is a standard, common
thing that everybody is going to run into. It should be handled by a Bridle
rule set as a rule when writing files." The project check is the local form of
that rule until bridle has a pack rule for it.
