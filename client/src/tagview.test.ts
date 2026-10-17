import { describe, expect, it } from "vitest";
import { tagFromPath, taskLabel } from "./tagview";

describe("tagFromPath", () => {
  it("reads a tag view address", () => {
    expect(tagFromPath("tag/online")).toBe("online");
    expect(tagFromPath("tag/Make-Bread")).toBe("make-bread");
  });
  it("leaves notes and other paths alone", () => {
    expect(tagFromPath("tag/online.md")).toBeNull();
    expect(tagFromPath("tag/a/b")).toBeNull();
    expect(tagFromPath("tag/")).toBeNull();
    expect(tagFromPath("area/health.md")).toBeNull();
  });
});

it("taskLabel drops the checkbox", () => {
  expect(taskLabel("  - [ ] Call #online")).toBe("Call #online");
});
