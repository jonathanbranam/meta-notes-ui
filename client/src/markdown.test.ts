import { describe, expect, it } from "vitest";
import { inlineSegments, noteDate, parseClock, tags } from "./markdown";

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

describe("inlineSegments", () => {
  const ctx = { path: "daily/2026-10-07 Wed.md", files: new Set(["projects/Plan.md"]), today: "2026-10-07", nowMinutes: 0 };
  it("leaves plain text alone", () => {
    expect(inlineSegments("just text", ctx)).toEqual([{ text: "just text" }]);
  });
  it("links a wiki link, with alias and heading", () => {
    expect(inlineSegments("see [[projects/Plan]] now", ctx)).toEqual([{ text: "see " }, { text: "projects/Plan", href: "#projects/Plan.md" }, { text: " now" }]);
    expect(inlineSegments("[[projects/Plan#Goals|the plan]]", ctx)).toEqual([{ text: "the plan", href: "#projects/Plan.md#goals" }]);
  });
  it("marks a missing note", () => {
    expect(inlineSegments("[[Nope]]", ctx)).toEqual([{ text: "Nope", missing: true }]);
  });
  it("links a URL without trailing punctuation", () => {
    expect(inlineSegments("go https://example.com/a?b=1, ok", ctx)).toEqual([{ text: "go " }, { text: "https://example.com/a?b=1", url: "https://example.com/a?b=1" }, { text: ", ok" }]);
  });
});
