import { expect, test } from "vitest";
import { isNewVersion } from "./version";

test("versions differ -> new version bar", () => {
  expect(isNewVersion("0.14.0", "0.15.0")).toBe(true);
  expect(isNewVersion("0.14.0", "0.14.0")).toBe(false);
  expect(isNewVersion("0.14.0", undefined)).toBe(false);
});
