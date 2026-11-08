import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { isMobileWidth, messageBody, messageSite, pageForTab, remember, submitsOnKey, topBarShows, type TabId, type TabMemory } from "../../client/src/tabs";

export function tabsSteps(steps: Steps) {
  steps.when(/^the viewport is (\d+) pixels wide$/, (w, n) => {
    w.bar = isMobileWidth(Number(n));
    w.mobile = w.bar;
  });
  steps.when(/^the user is on the (Now|Home|Lists|Tasks) tab$/, (w, name) => {
    w.tab = name.toLowerCase() as TabId;
  });
  steps.then(/^the top bar shows$/, (w) => expect(topBarShows(w.mobile, w.tab)).toBe(true));
  steps.then(/^the top bar does not show$/, (w) => expect(topBarShows(w.mobile, w.tab)).toBe(false));
  steps.then(/^the Message button is in the top bar$/, (w) => expect(messageSite(w.mobile, w.tab)).toBe("bar"));
  steps.then(/^the Message button is on the page, not in the top bar$/, (w) => expect(messageSite(w.mobile, w.tab)).toBe("page"));
  steps.then(/^the tab bar shows$/, (w) => expect(w.bar).toBe(true));
  steps.then(/^the tab bar does not show$/, (w) => expect(w.bar).toBe(false));
  steps.when(/^the user opens "([^"]+)" on Home, then Lists, then taps Home$/, (w, page) => {
    let mem: TabMemory = { now: "!now", home: "!today", lists: "!lists", tasks: "!tasks" };
    mem = remember(mem, page);
    mem = remember(mem, "!lists");
    w.page = pageForTab(mem, "home");
  });
  steps.then(/^the page is "([^"]+)"$/, (w, page) => expect(w.page).toBe(page));
  steps.when(/^the user sends "([^"]+)" from the page "([^"]+)"$/, (w, text, page) => {
    w.text = messageBody(text, page);
  });
  steps.then(/^the message text is "([^"]+)" followed by a blank line and "([^"]+)"$/, (w, head, tail) => {
    expect(w.text).toBe(`${head}\n\n${tail}`);
  });
  steps.when(/^the user presses Enter without Shift in the sheet$/, (w) => {
    w.submitted = submitsOnKey({ key: "Enter", shiftKey: false });
  });
  steps.then(/^the message is submitted$/, (w) => expect(w.submitted).toBe(true));
}
