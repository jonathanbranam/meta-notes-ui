import { describe, expect, it } from "vitest";
import { decodeAgain, extractLinks, parseWikiLink } from "./links";

// Resolving links is specified in design/specs/rendering.md.
describe("links in text", () => {
  it("parses alias and anchor", () => {
    expect(parseWikiLink("project/Make Bread|bread")).toEqual({ target: "project/Make Bread", alias: "bread", heading: undefined });
    expect(parseWikiLink("area/health#goals")).toEqual({ target: "area/health", alias: undefined, heading: "goals" });
  });
  it("extracts targets", () => {
    expect(extractLinks("See [[area/health|h]] and [[project/kitchen]].\n[[ ]]")).toEqual([
      "area/health",
      "project/kitchen",
    ]);
  });
});

describe("a double-encoded address", () => {
  it("decodes the path once more", () => {
    expect(decodeAgain("area/family/gifts/Christmas%202026.md")).toBe("area/family/gifts/Christmas 2026.md");
  });
  it("gives no retry for a stray percent", () => {
    expect(decodeAgain("area/Sale 100%.md")).toBeNull();
  });
  it("gives no retry when there is nothing to decode", () => {
    expect(decodeAgain("area/health.md")).toBeNull();
  });
  it("decodes once, not until stable", () => {
    expect(decodeAgain("a%2520b.md")).toBe("a%20b.md");
  });
});
