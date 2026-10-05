import { describe, expect, it } from "vitest";
import { extractLinks, parseWikiLink, resolveLink } from "./links";

const files = new Set([
  "project/Make Bread.md",
  "project/kitchen/Home.md",
  "plan/week/26-Q4/2026-09-28.md",
  "plan/daily/26-Q4/2026-10-04 Sun.md",
  "area/health.md",
]);
const from = "plan/daily/26-Q4/2026-10-04 Sun.md";

describe("resolveLink", () => {
  it("resolves root paths, with or without .md", () => {
    expect(resolveLink("project/Make Bread", from, files)).toBe("project/Make Bread.md");
    expect(resolveLink("area/health.md", from, files)).toBe("area/health.md");
  });
  it("resolves folder notes", () => {
    expect(resolveLink("project/kitchen", from, files)).toBe("project/kitchen/Home.md");
  });
  it("resolves relative to the linking note", () => {
    expect(resolveLink("../../week/26-Q4/2026-09-28", from, files)).toBe("plan/week/26-Q4/2026-09-28.md");
    expect(resolveLink("health", "area/x.md", files)).toBe("area/health.md");
  });
  it("is null for missing targets and paths out of the root", () => {
    expect(resolveLink("project/nope", from, files)).toBeNull();
    expect(resolveLink("../../../../../etc/passwd", from, files)).toBeNull();
    expect(resolveLink("", from, files)).toBeNull();
  });
});

describe("links in text", () => {
  it("parses alias and anchor", () => {
    expect(parseWikiLink("project/Make Bread|bread")).toEqual({ target: "project/Make Bread", alias: "bread" });
    expect(parseWikiLink("area/health#goals")).toEqual({ target: "area/health", alias: undefined });
  });
  it("extracts targets", () => {
    expect(extractLinks("See [[area/health|h]] and [[project/kitchen]].\n[[ ]]")).toEqual([
      "area/health",
      "project/kitchen",
    ]);
  });
});
