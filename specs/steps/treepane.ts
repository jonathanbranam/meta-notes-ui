import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { clampTreeWidth, readTreePane, writeTreePane } from "../../client/src/treepane";

/** A stand-in for the browser's localStorage, so the spec can "reload" by reading it again. */
function fakeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

export function treepaneSteps(steps: Steps) {
  steps.when(/^the tree width is set to (\d+), then (\d+)$/, (w, a, b) => {
    w.widths = [clampTreeWidth(Number(a)), clampTreeWidth(Number(b))];
  });
  steps.then(/^the width is (\d+), then (\d+)$/, (w, a, b) => {
    expect(w.widths).toEqual([Number(a), Number(b)]);
  });
  steps.when(/^the tree is collapsed at width (\d+) and the app is loaded again$/, (w, width) => {
    (globalThis as { localStorage?: unknown }).localStorage = fakeStorage();
    writeTreePane({ collapsed: true, width: Number(width) });
    w.pane = readTreePane();
  });
  steps.when(/^the app is loaded with nothing stored$/, (w) => {
    (globalThis as { localStorage?: unknown }).localStorage = fakeStorage();
    w.pane = readTreePane();
  });
  steps.then(/^the tree is collapsed at width (\d+)$/, (w, width) => {
    expect(w.pane).toEqual({ collapsed: true, width: Number(width) });
  });
  steps.then(/^the tree is open at width (\d+)$/, (w, width) => {
    expect(w.pane).toEqual({ collapsed: false, width: Number(width) });
  });
}
