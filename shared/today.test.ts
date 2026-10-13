import { describe, expect, it } from "vitest";
import { parseClock } from "./today.js";

// Alerts and the Time Block are specified in design/specs/today.md; this is an internal.
describe("parseClock", () => {
  it("reads clocks and refuses other text", () => {
    expect(parseClock("8:15am")).toBe(495);
    expect(parseClock("12:00pm")).toBe(720);
    expect(parseClock("12:30am")).toBe(30);
    expect(parseClock("Time")).toBeNull();
  });
});
