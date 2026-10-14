import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { alertsItem, closesMenu, dayLink } from "../../client/src/menu";

export function menuSteps(steps: Steps) {
  steps.when(/^the server has push on, notifications are allowed, and this device is not subscribed$/, (w) => {
    w.item = alertsItem("available", "granted");
  });
  steps.when(/^the server has push on and this device is subscribed$/, (w) => {
    w.item = alertsItem("on", "granted");
  });
  steps.when(/^the server has push off$/, (w) => {
    w.item = alertsItem("off", "default");
  });
  steps.then(/^the menu's alerts item is "([^"]+)"$/, (w, label) => {
    expect(w.item?.label).toBe(label);
  });
  steps.then(/^the menu has no alerts item$/, (w) => {
    expect(w.item).toBeNull();
  });

  steps.when(/^Escape is pressed, or a press lands outside the menu$/, (w) => {
    w.closed = [closesMenu({ type: "keydown", key: "Escape" }), closesMenu({ type: "pointerdown", inside: false })];
  });
  steps.then(/^the menu closes$/, (w) => {
    expect(w.closed).toEqual([true, true]);
  });
  steps.when(/^a press lands inside the menu$/, (w) => {
    w.closed = [closesMenu({ type: "pointerdown", inside: true })];
  });
  steps.then(/^the menu stays open$/, (w) => {
    expect(w.closed).toEqual([false]);
  });

  steps.when(/^the user is on Today and today's daily note is "([^"]+)"$/, (w, daily) => {
    w.link = dayLink(true, "!today", daily);
  });
  steps.when(/^the user is on "([^"]+)" and today's daily note is (?:that note|"([^"]+)")$/, (w, cur, daily) => {
    w.link = dayLink(false, cur, daily ?? cur);
  });
  steps.then(/^the link is "([^"]+)" to Today$/, (w, label) => {
    expect(w.link).toEqual({ label, to: "today" });
  });
  steps.then(/^the link is "([^"]+)" to "([^"]+)"$/, (w, label, to) => {
    expect(w.link).toEqual({ label, to });
  });
  steps.then(/^there is no link$/, (w) => {
    expect(w.link).toBeNull();
  });
}
