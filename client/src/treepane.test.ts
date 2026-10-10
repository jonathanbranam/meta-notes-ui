import { beforeEach, expect, test } from "vitest";
import { clampTreeWidth, readTreePane, TREE_DEFAULT, TREE_MAX, TREE_MIN, writeTreePane } from "./treepane";

function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

beforeEach(() => {
  (globalThis as { localStorage?: unknown }).localStorage = fakeStorage();
});

test("width is clamped to the min and max", () => {
  expect(clampTreeWidth(10)).toBe(TREE_MIN);
  expect(clampTreeWidth(5000)).toBe(TREE_MAX);
  expect(clampTreeWidth(300.4)).toBe(300);
  expect(clampTreeWidth(NaN)).toBe(TREE_DEFAULT);
});

test("nothing stored gives an open tree at the default width", () => {
  expect(readTreePane()).toEqual({ collapsed: false, width: TREE_DEFAULT });
});

test("collapsed state and width survive a reload", () => {
  writeTreePane({ collapsed: true, width: 350 });
  expect(readTreePane()).toEqual({ collapsed: true, width: 350 });
});

test("a stored width out of range or garbage is clamped", () => {
  localStorage.setItem("meta-notes-ui.tree-width", "9999");
  expect(readTreePane().width).toBe(TREE_MAX);
  localStorage.setItem("meta-notes-ui.tree-width", "abc");
  expect(readTreePane().width).toBe(TREE_DEFAULT);
});
