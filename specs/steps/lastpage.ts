import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { TODAY_PATH } from "../../client/src/TodayView";
import { startHash } from "../../client/src/lastpage";

export function lastpageSteps(steps: Steps) {
  steps.when(/^the app starts with no page in the URL and the page "([^"]+)" is stored$/, (w, stored) => {
    w.opened = startHash("", stored, TODAY_PATH);
  });
  steps.when(/^the app starts with no page in the URL and nothing is stored$/, (w) => {
    w.opened = startHash("", null, TODAY_PATH);
  });
  steps.when(/^the app starts with the URL naming "([^"]+)" and the page "([^"]+)" is stored$/, (w, url, stored) => {
    w.opened = startHash(url, stored, TODAY_PATH);
  });
  steps.then(/^the app opens "([^"]+)"$/, (w, path) => {
    expect(w.opened).toBe(path);
  });
  steps.then(/^the app opens Today$/, (w) => {
    expect(w.opened).toBe(TODAY_PATH);
  });
}
