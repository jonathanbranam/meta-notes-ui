---
id: versioning
severity: must
roles: [manager, worker]
---
The version is `version` in `package.json`, shown in the UI and by the
server's `/api/version`.

- **The worker bumps it** in the commit that completes a task that changes
  behaviour: PATCH for fixes, MINOR for features. Docs, tests only: no bump.
- **The manager tags** the merge commit `v<version>` after merging, and
  pushes the tag. Workers never tag.
