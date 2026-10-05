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
  it.each(["../secret.md", "area/../../secret.md", "/etc/passwd", "a\0b.md"])("refuses %j", async (p) => {
    await expect(confine(root, p)).rejects.toThrow();
  });
  it.each([".git/config.md", ".meta-notes-cache/ui/x.md", "node_modules/pkg/readme.md"])(
    "hides %s",
    async (p) => {
      await expect(confine(root, p)).rejects.toThrow("hidden");
    },
  );
  it("does not follow a symlink out of the root", async () => {
    await expect(confine(root, "link.md")).rejects.toThrow("outside");
  });
  it("reports a missing file", async () => {
    await expect(confine(root, "nope.md")).rejects.toThrow("not found");
  });
  it("detects hidden segments at any depth", () => {
    expect(isHidden("a/.venv/b.md")).toBe(true);
    expect(isHidden("a/b.md")).toBe(false);
  });
});
