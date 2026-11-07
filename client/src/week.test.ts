import { describe, expect, it } from "vitest";
import type { Slot } from "../../shared/week";
import { boxes, clockLabel, mondayOf, parseWeekPath } from "./week";

const s = (at: number, text: string): Slot => ({ at, kind: "plan", text });
const empty = (at: number): Slot => ({ at, kind: "empty", text: "" });

describe("week page helpers", () => {
  it("merges equal consecutive slots into one box and skips empty ones", () => {
    const b = boxes([empty(0), s(15, "A"), s(30, "A"), s(45, "B"), empty(60), s(75, "B")]);
    expect(b.map((x) => [x.from, x.span])).toEqual([[1, 2], [3, 1], [5, 1]]);
  });
  it("finds the Monday, also from a Sunday", () => {
    expect(mondayOf("2026-11-08")).toBe("2026-11-02");
    expect(mondayOf("2026-11-02")).toBe("2026-11-02");
  });
  it("falls back to this week and 5 days on a bad path", () => {
    expect(parseWeekPath("!week?start=nope&days=9", "2026-11-07")).toEqual({ monday: "2026-11-02", days: 5 });
  });
  it("labels a time", () => {
    expect(clockLabel(0)).toBe("12:00 AM");
    expect(clockLabel(13 * 60 + 15)).toBe("1:15 PM");
  });
});
