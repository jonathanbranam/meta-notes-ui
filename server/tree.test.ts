import { beforeAll, expect, it } from "vitest";
import { makeFixtureRoot } from "./fixture.js";
import { listTree } from "./tree.js";

let root: string;
beforeAll(async () => {
  ({ root } = await makeFixtureRoot());
});

it("lists folders and .md files, PPARA folders first, hidden names and symlinks skipped", async () => {
  const tree = await listTree(root);
  expect(tree.map((n) => n.name)).toEqual([
    "plan",
    "project",
    "area",
    "alpha",
    "zeta",
    "root.md",
  ]);
  const plan = tree[0];
  expect(plan.children?.[0].children?.[0].children?.[0]).toEqual({
    name: "2026-10-04 Sun.md",
    path: "plan/daily/26-Q4/2026-10-04 Sun.md",
    type: "file",
  });
});
