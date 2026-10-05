import { describe, expect, it } from "vitest";
import { noteDate, parseClock, tags } from "./markdown";

// Rendering is specified and tested in design/specs/rendering.md; these are internals.
const DAILY = "plan/daily/26-Q4/2026-10-04 Sun.md";

describe("helpers", () => {
  it("parses clocks and note dates", () => {
    expect(parseClock("8:15am")).toBe(495);
    expect(parseClock("12:00pm")).toBe(720);
    expect(parseClock("12:30am")).toBe(30);
    expect(parseClock("Time")).toBeNull();
    expect(noteDate(DAILY)).toBe("2026-10-04");
    expect(noteDate("area/health.md")).toBeNull();
  });
});

describe("tag aliases", () => {
  it("folds an alias to its canonical tag and leaves others", () => {
    const out = tags([{ type: "text", value: "#Mtg #other" }], { mtg: "meeting" }) as any[];
    expect(out.filter((n) => n.data).map((n) => n.data.hProperties["data-tag"])).toEqual(["meeting", "other"]);
  });
  it("does not fold without aliases", () => {
    const [a] = tags([{ type: "text", value: "#mtg" }]) as any[];
    expect(a.data.hProperties["data-tag"]).toBe("mtg");
  });
});
