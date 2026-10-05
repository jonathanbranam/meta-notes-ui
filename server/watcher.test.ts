import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Debouncer } from "./watcher.js";

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
