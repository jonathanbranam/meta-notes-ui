import { expect, test } from "vitest";
import { startHash } from "./lastpage";

const TODAY = "!today";

test("stored page reopened when no hash", () => {
  expect(startHash("", "Projects/Plan", TODAY)).toBe("Projects/Plan");
});

test("nothing stored and no hash opens Today", () => {
  expect(startHash("", null, TODAY)).toBe(TODAY);
});

test("explicit hash beats the stored page", () => {
  expect(startHash("Daily/2026-10-04", "Projects/Plan", TODAY)).toBe("Daily/2026-10-04");
});
