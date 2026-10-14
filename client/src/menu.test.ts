import { describe, expect, it } from "vitest";
import { alertsItem, closesMenu } from "./menu";

describe("alertsItem", () => {
  it("is absent when push is off on the server", () => {
    expect(alertsItem("off", "default")).toBeNull();
    expect(alertsItem("off", "granted")).toBeNull();
  });
  it("is absent when the browser cannot notify", () => {
    expect(alertsItem("available", "unsupported")).toBeNull();
  });
  it("asks for permission first, then subscribes", () => {
    expect(alertsItem("available", "default")).toEqual({ label: "Enable alerts", action: "ask" });
    expect(alertsItem("available", "granted")).toEqual({ label: "Enable alerts", action: "enable" });
  });
  it("turns alerts off when subscribed", () => {
    expect(alertsItem("on", "granted")).toEqual({ label: "Alerts off", action: "disable" });
  });
  it("only notes a blocked browser", () => {
    expect(alertsItem("available", "denied")?.action).toBeNull();
  });
});

describe("closesMenu", () => {
  it("closes on Escape and on a press outside", () => {
    expect(closesMenu({ type: "keydown", key: "Escape" })).toBe(true);
    expect(closesMenu({ type: "pointerdown", inside: false })).toBe(true);
  });
  it("stays open on other keys and on a press inside", () => {
    expect(closesMenu({ type: "keydown", key: "a" })).toBe(false);
    expect(closesMenu({ type: "pointerdown", inside: true })).toBe(false);
  });
});
