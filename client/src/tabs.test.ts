import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import { MessageSheet } from "./MessageSheet";
import { TabBar } from "./TabBar";
import { isMobileWidth, LISTS_PATH, messageBody, pageForTab, remember, submitsOnKey, tabOf, type TabMemory } from "./tabs";

test("a phone viewport gets the tab bar, a desktop one does not", () => {
  expect(isMobileWidth(390)).toBe(true);
  expect(isMobileWidth(1280)).toBe(false);
});

test("the tab bar renders Now, Home and Lists in that order and marks the active one", () => {
  const html = renderToString(createElement(TabBar, { active: "lists", onPick: () => {} }));
  expect(html.indexOf("Now")).toBeLessThan(html.indexOf("Home"));
  expect(html.indexOf("Home")).toBeGreaterThan(-1);
  expect(html.indexOf("Home")).toBeLessThan(html.indexOf("Lists"));
  expect(html).toMatch(/class="active"[^>]*aria-current="page"[^>]*>Lists/);
});

test("tabs map from the page", () => {
  expect(tabOf("!now")).toBe("now");
  expect(tabOf("!today")).toBe("home");
  expect(tabOf("Projects/Plan.md")).toBe("home");
  expect(tabOf(LISTS_PATH)).toBe("lists");
  expect(tabOf("!lists/resource/lists/26-Q4/store.md")).toBe("lists");
});

test("switching tabs returns to where each tab was", () => {
  let mem: TabMemory = { now: "!now", home: "!today", lists: LISTS_PATH };
  mem = remember(mem, "Projects/Plan.md");
  mem = remember(mem, "!lists/a.md");
  expect(pageForTab(mem, "home")).toBe("Projects/Plan.md");
  expect(pageForTab(mem, "lists")).toBe("!lists/a.md");
});

test("the message carries the page context and the trimmed text", () => {
  expect(messageBody("  buy milk \n", "!lists/a.md")).toBe("[from the UI, page: !lists/a.md]\n\nbuy milk");
});

test("Enter submits, Shift+Enter and composing do not", () => {
  expect(submitsOnKey({ key: "Enter", shiftKey: false })).toBe(true);
  expect(submitsOnKey({ key: "Enter", shiftKey: true })).toBe(false);
  expect(submitsOnKey({ key: "Enter", shiftKey: false, isComposing: true })).toBe(false);
  expect(submitsOnKey({ key: "a", shiftKey: false })).toBe(false);
});

test("the shared sheet renders a Send button and the aide placeholder", () => {
  const html = renderToString(createElement(MessageSheet, { context: "!today", send: async () => ({ ok: true }), onClose: () => {}, onSent: () => {} }));
  expect(html).toContain("Message to the aide");
  expect(html).toContain("Send");
});
