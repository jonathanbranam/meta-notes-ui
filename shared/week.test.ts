import { describe, expect, it } from "vitest";
import { cascade, daySlots, readLog } from "./week.js";

describe("readLog", () => {
  it("keeps an entry with neither time out of the grid", () => {
    const r = readLog([{ line: 5, text: "x:", start: null, end: null }], null);
    expect(r.entries).toEqual([]);
    expect(r.errors).toEqual([{ label: "missing start", text: "x", at: null }]);
  });
  it("only the last open entry runs, and only when it started before now", () => {
    const cli = [
      { line: 5, text: "a:", start: "09:00", end: null },
      { line: 8, text: "b:", start: "10:00", end: null },
    ];
    expect(readLog(cli, 10 * 60 + 5).errors.map((e) => e.text)).toEqual(["a"]);
    expect(readLog(cli, 9 * 60 + 30).errors.map((e) => e.text)).toEqual(["a", "b"]);
  });
  it("reads duplicate starts and ends from the CLI's errors", () => {
    const r = readLog(
      [
        { line: 5, text: "a:", start: "09:20", end: "09:45", errors: ["duplicate start"] },
        { line: 9, text: "b:", start: "10:00", end: "10:45", errors: ["duplicate end"] },
      ],
      null,
    );
    expect(r.entries.map((e) => e.text)).toEqual(["a", "b"]);
    expect(r.errors).toEqual([
      { label: "duplicate starts", text: "a", at: 555 },
      { label: "duplicate ends", text: "b", at: 645 },
    ]);
  });
});

describe("cascade and daySlots", () => {
  it("a log error in the future is a future error, and a later log entry wins an overlap", () => {
    expect(cascade(0, true, { logError: { label: "missing end", text: "x" } }).error).toBe("in the future");
    const day = daySlots({
      nowMin: Infinity,
      entries: [
        { text: "first", start: 540, end: 570 },
        { text: "second", start: 555, end: 570 },
      ],
      errors: [],
      block: [],
      events: [],
    });
    expect(day.slots.slice(36, 38).map((s) => s.text)).toEqual(["first", "second"]);
  });
  it("struck out and no plan rows are no plan", () => {
    const row = (plan: string) => ({ minutes: 540, plan, time: "9:00am", actual: "", line: "" });
    const day = daySlots({ nowMin: -Infinity, entries: [], errors: [], block: [row("~old~")], events: [] });
    expect(day.slots[36].kind).toBe("empty");
  });
});
