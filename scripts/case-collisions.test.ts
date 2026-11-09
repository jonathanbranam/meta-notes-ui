import { describe, expect, it } from "vitest";
import { findCaseCollisions } from "./check-case-collisions.mjs";

describe("findCaseCollisions", () => {
  it("passes distinct paths, including same names in different folders", () => {
    expect(findCaseCollisions(["client/src/version.ts", "server/version.ts", "client/src/main.tsx"])).toEqual([]);
  });

  it("flags a .ts and .tsx pair that differ only by case", () => {
    expect(findCaseCollisions(["client/src/timelog.ts", "client/src/TimeLog.tsx"])).toEqual([
      ["client/src/timelog.ts", "client/src/TimeLog.tsx"],
    ]);
  });

  it("flags a pair that differs only by case in the same extension", () => {
    expect(findCaseCollisions(["server/Tree.ts", "server/tree.ts"])).toEqual([["server/Tree.ts", "server/tree.ts"]]);
  });
});
