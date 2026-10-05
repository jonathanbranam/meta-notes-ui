import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChangeEvent } from "../shared/types.js";
import { Debouncer, watchRoot } from "./watcher.js";

describe("Debouncer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("flushes a burst once, deduplicated, after the quiet period", () => {
    const flush = vi.fn();
    const d = new Debouncer<string>(200, flush);
    d.add("a.md");
    vi.advanceTimersByTime(150);
    d.add("b.md");
    d.add("a.md");
    vi.advanceTimersByTime(150);
    expect(flush).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60);
    expect(flush).toHaveBeenCalledTimes(1);
    expect(flush).toHaveBeenCalledWith(["a.md", "b.md"]);
  });
});

describe("watchRoot", () => {
  it("reports added then changed for a file, ignoring hidden dirs", async () => {
    const root = await realpath(await mkdtemp(path.join(tmpdir(), "mnui-w-")));
    const batches: ChangeEvent[][] = [];
    const w = watchRoot(root, (e) => batches.push(e), 30);
    const waitFor = async (n: number) => {
      for (let i = 0; i < 200 && batches.length < n; i++) await new Promise((r) => setTimeout(r, 25));
    };
    try {
      await writeFile(path.join(root, "n.md"), "one");
      await waitFor(1);
      expect(batches[0]).toEqual([{ type: "added", path: "n.md" }]);
      await writeFile(path.join(root, "n.md"), "two");
      await waitFor(2);
      expect(batches[1]).toEqual([{ type: "changed", path: "n.md" }]);
    } finally {
      w.close();
      await rm(root, { recursive: true, force: true });
    }
  });
});
