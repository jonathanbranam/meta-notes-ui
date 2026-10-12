import { describe, expect, it } from "vitest";
import { neighbours } from "./neighbours";

const daily = [
  "plan/daily/25-Q4/2025-12-31 Wed.md",
  "plan/daily/26-Q1/2026-01-02 Fri.md",
  "plan/daily/26-Q1/2026-03-31 Tue.md",
  "plan/daily/26-Q2/2026-04-01 Wed.md",
];

describe("neighbours", () => {
  it("steps across quarter and year folders, skipping missing days", () => {
    expect(neighbours(daily[1], daily)).toEqual({ prev: daily[0], next: daily[2] });
    expect(neighbours(daily[2], daily)).toEqual({ prev: daily[1], next: daily[3] });
  });
  it("is disabled at either end", () => {
    expect(neighbours(daily[0], daily).prev).toBeNull();
    expect(neighbours(daily[3], daily).next).toBeNull();
  });
  it("places a daily note that does not exist yet", () => {
    expect(neighbours("plan/daily/26-Q1/2026-02-01 Sun.md", daily)).toEqual({ prev: daily[1], next: daily[2] });
  });
  it("uses the sorted .md files of the folder elsewhere", () => {
    const files = ["a.md", "Proj/a.md", "Proj/b.md", "Proj/c.txt", "Proj/sub/z.md", "Proj/d.md", "z.md"];
    expect(neighbours("Proj/b.md", files)).toEqual({ prev: "Proj/a.md", next: "Proj/d.md" });
    expect(neighbours("Proj/a.md", files).prev).toBeNull();
    expect(neighbours("Proj/d.md", files).next).toBeNull();
    expect(neighbours("a.md", files)).toEqual({ prev: null, next: "z.md" });
  });
});

import { dailyPath } from "./neighbours";
it("names a day's daily note", () => {
  expect(dailyPath(new Date(2026, 3, 1))).toBe("plan/daily/26-Q2/2026-04-01 Wed.md");
});
