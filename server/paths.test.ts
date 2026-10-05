import { beforeAll, describe, expect, it } from "vitest";
import { makeFixtureRoot } from "./fixture.js";
import { confine, isHidden } from "./paths.js";

let root: string;
beforeAll(async () => {
  ({ root } = await makeFixtureRoot());
});

describe("confine", () => {
  it("resolves a note inside the root", async () => {
    await expect(confine(root, "area/health.md")).resolves.toBe(`${root}/area/health.md`);
  });
  it("reports a missing file", async () => {
    await expect(confine(root, "nope.md")).rejects.toThrow("not found");
  });
  it("detects hidden segments at any depth", () => {
    expect(isHidden("a/.venv/b.md")).toBe(true);
    expect(isHidden("a/b.md")).toBe(false);
  });
});
