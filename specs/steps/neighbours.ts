import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { neighbours } from "../../client/src/neighbours";

const list = (s: string) => [...s.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

export function neighboursSteps(steps: Steps) {
  steps.when(/^the user is on "([^"]+)" and the folder holds (.+)$/, (w, cur, files) => {
    w.n = neighbours(cur, list(files));
  });
  steps.when(/^the user is on "([^"]+)" and "([^"]+)" exists$/, (w, cur, other) => {
    w.n = neighbours(cur, [cur, other]);
  });
  steps.then(/^previous is "([^"]+)" and next is "([^"]+)"$/, (w, p, n) => {
    expect(w.n).toEqual({ prev: p, next: n });
  });
  steps.then(/^previous is disabled and next is "([^"]+)"$/, (w, n) => {
    expect(w.n).toEqual({ prev: null, next: n });
  });
  steps.then(/^next is "([^"]+)"$/, (w, n) => {
    expect(w.n.next).toBe(n);
  });
}
