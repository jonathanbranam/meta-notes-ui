import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync(new URL("./style.css", import.meta.url), "utf8");
const lists = readFileSync(new URL("./ListsView.tsx", import.meta.url), "utf8");

test("checkbox marks are drawn images, not text glyphs", () => {
  expect(css).not.toMatch(/\.task-item[^{]*::before\s*\{[^}]*content:\s*"[^"]/);
  expect(css).toMatch(/\.task-item\.status-done::before[^{]*\{[^}]*background-image/);
  expect(css).toMatch(/\.lists \.item\.canceled \.box/);
});

test("the list box holds no letter", () => {
  expect(lists).not.toMatch(/"x"\s*:\s*""/);
});
