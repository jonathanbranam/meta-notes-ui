import { describe, expect, it } from "vitest";
import { extractLinks, parseWikiLink } from "./links";

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
