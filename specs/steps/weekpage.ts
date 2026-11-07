import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import type { WeekDay, WeekResponse } from "../../server/week.js";
import type { Slot } from "../../shared/week.js";
import { WeekGrid } from "../../client/src/WeekView";
import { addDays, parseWeekPath, stepWeek, firstDay, weekPath } from "../../client/src/week";

type World = Record<string, any>;

const day = (date: string, slots: Slot[] = [], tasks: string[] = []): WeekDay => ({
  date,
  note: null,
  slots: Array.from({ length: 96 }, (_, i) => slots.find((s) => s.at === i * 15) ?? { at: i * 15, kind: "empty", text: "" }),
  unplaced: [],
  logErrors: [],
  allDay: [],
  tasks: tasks.map((text, i) => ({ file: "a.md", line: i + 1, text, due: date, time: null })),
});

/** Renders a one-day grid on 2026-11-07 with `nowMin` and returns the markup and the DOM-ish parts of the box. */
function render(days: WeekDay[], nowMin = 12 * 60): string {
  const week: WeekResponse = { start: days[0].date, days, calendar: true };
  return renderToStaticMarkup(createElement(WeekGrid, { week, today: "2026-11-07", nowMin }));
}

/** The class and text of the nth box. */
function box(html: string, n = 0): { cls: string; text: string } {
  const m = [...html.matchAll(/<div class="(wk-box[^"]*)"[^>]*>(.*?)<\/div>/g)][n];
  return { cls: m?.[1] ?? "", text: (m?.[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() };
}
const badgeOf = (html: string, n = 0) => /<div class="wk-box[^"]*"[^>]*>(.*?)<\/div>/g[Symbol.matchAll](html).toArray()[n]?.[1]?.match(/wk-badge">([^<]+)</)?.[1];

export function weekPageSteps(steps: Steps) {
  steps.when(/^the grid draws a past slot from the Time Log "([^"]+)"$/, (w, text) => {
    w.html = render([day("2026-11-06", [{ at: 600, kind: "log", text }])]);
  });
  steps.then(/^the slot has the style "([^"]+)" and no badge$/, (w, cls) => {
    expect(box(w.html).cls).toContain(cls);
    expect(badgeOf(w.html)).toBeUndefined();
  });
  steps.when(/^the grid draws past slots from Actual "Ran long" \(badge A\), Plan "Email" \(badge P\) and Calendar "Standup" \(badge Cal\)$/, (w) => {
    w.html = render([
      day("2026-11-06", [
        { at: 600, kind: "actual", text: "Ran long", badge: "A" },
        { at: 660, kind: "plan", text: "Email", badge: "P" },
        { at: 720, kind: "calendar", text: "Standup", badge: "Cal" },
      ]),
    ]);
  });
  steps.then(/^each slot has the shared style "([^"]+)" and its badge$/, (w, cls) => {
    ["A", "P", "Cal"].forEach((b, i) => {
      expect(box(w.html, i).cls).toContain(cls);
      expect(badgeOf(w.html, i)).toBe(b);
    });
  });
  steps.when(/^the grid draws a future slot from the Plan "([^"]+)"$/, (w, text) => {
    w.html = render([day("2026-11-08", [{ at: 600, kind: "plan", text }])]);
  });
  steps.when(/^the grid draws a future slot from the Calendar "([^"]+)"$/, (w, text) => {
    w.html = render([day("2026-11-08", [{ at: 600, kind: "calendar", text, badge: "Cal" }])]);
  });
  steps.then(/^the slot has the style "([^"]+)" and the badge "([^"]+)"$/, (w, cls, b) => {
    expect(box(w.html).cls).toContain(cls);
    expect(badgeOf(w.html)).toBe(b);
  });
  steps.when(/^the grid draws a (past|future) slot that is the error "([^"]+)"$/, (w, when, error) => {
    w.html = render([day(when === "past" ? "2026-11-06" : "2026-11-08", [{ at: 600, kind: "error", text: "Write report", error }])]);
  });
  steps.then(/^the slot has the style "([^"]+)" and the label "([^"]+)"$/, (w, cls, label) => {
    expect(box(w.html).cls).toContain(cls);
    expect(w.html).toContain(`wk-label">${label}<`);
  });

  steps.when(/^the page path is "([^"]+)"$/, (w, p) => {
    w.page = parseWeekPath(p, "2026-11-07");
  });
  steps.when(/^the page path is "([^"]+)" on (\d{4}-\d{2}-\d{2})$/, (w, p, today) => {
    w.page = parseWeekPath(p, today);
  });
  steps.then(/^the week is the Monday (\S+) and (\d) days are shown$/, (w, monday, n) => {
    expect(w.page.monday).toBe(monday);
    expect(w.page.days).toBe(Number(n));
  });
  steps.then(/^the grid starts on (\S+)$/, (w, d) => expect(firstDay(w.page)).toBe(d));
  steps.when(/^the user steps to the next week from "([^"]+)"$/, (w, p) => {
    w.next = weekPath(stepWeek(parseWeekPath(p, "2026-11-07"), 1));
  });
  steps.then(/^the page path is "([^"]+)"$/, (w, p) => expect(w.next).toBe(p));

  steps.when(/^the grid draws a day with 2 tasks due$/, (w) => {
    w.html = render([day("2026-11-08", [], ["Pay rent", "Call Sam"])]);
  });
  steps.then(/^the day shows a collapsed list "2 due" holding both tasks$/, (w) => {
    expect(w.html).toContain("<details");
    expect(w.html).not.toContain("<details open");
    expect(w.html).toContain("<summary>2 due</summary>");
    expect(w.html).toContain("Pay rent");
    expect(w.html).toContain("Call Sam");
  });
  steps.when(/^the grid draws 2026-11-06 and 2026-11-07 and today is 2026-11-07$/, (w) => {
    w.html = render([day("2026-11-06"), day("2026-11-07")]);
  });
  steps.then(/^only the column of 2026-11-07 has a now line$/, (w) => {
    expect((w.html.match(/wk-now/g) ?? []).length).toBe(1);
    const col = w.html.split('data-date="2026-11-07"')[1];
    expect(col).toContain("wk-now");
    expect(addDays("2026-11-07", 0)).toBe("2026-11-07");
  });
}
