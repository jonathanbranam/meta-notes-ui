+++
id = "mu-ask3"
title = "create-login: the nuc.md path and --help"
kind = "bug"
state = "open"
created_at = "2026-10-08T03:34:14.540Z"
updated_at = "2026-10-08T03:34:14.710063438Z"
created_by = "external:orchestrator"
watchers = ["external:orchestrator"]
+++

Found by aide after mu-k6q8 (974612c). (1) deploy/nuc.md says to run bin/meta-notes-ui create-login in the checkout after the build, but the always-on deploy builds out of tree (mkkt), so the checkout has no dist/ and it fails. Document the build's path: ~/.local/share/meta-notes-ui/current/bin/meta-notes-ui create-login <username> --root <notes>. (2) bin/meta-notes-ui create-login --help errors with 'Unknown option'; make --help (and -h) print usage and exit 0. Model: Haiku. Size: XS. Files: deploy/nuc.md, README.md if it repeats the path, the create-login entry (server/ or bin/), a test for --help. Verify: npm run check green once. Rule human-server: never touch port 7480 or the unit.
