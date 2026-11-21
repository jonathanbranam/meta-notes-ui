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

test("done and canceled note tasks are muted, canceled struck, even in tight lists (no <p>)", () => {
  expect(css).toMatch(/\.task-item\.status-canceled \{ text-decoration: line-through; \}/);
  expect(css).not.toMatch(/\.task-item\.status-canceled > p/);
});

test("the note task box is a float, so labels line up in every state", () => {
  expect(css).toMatch(/\.task-item::before \{[^}]*float: left/);
});

test("an .overlay dialog stacks above the sticky and fixed layers of the page (mu-t2jr)", () => {
  const z = (sel: string) => Number(new RegExp(`^${sel} \\{[^}]*z-index: (\\d+)`, "m").exec(css)?.[1]);
  const overlay = z("\\.overlay");
  for (const sel of ["\\.wk-head", "\\.wk-bar", "\\.tabbar", "\\.drawer", "\\.scrim"]) {
    expect(overlay).toBeGreaterThan(z(sel) || 0);
  }
});
