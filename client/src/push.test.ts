import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { pushAvailable } from "./push";

// A browser with a service worker ready, so the only question is what the server answers.
beforeEach(() => {
  vi.stubGlobal("window", { PushManager: class {} });
  vi.stubGlobal("navigator", { serviceWorker: { ready: Promise.resolve({ pushManager: {} }) } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const answer = (body: string, init: ResponseInit) => vi.fn(async () => new Response(body, init));

test("push off: a JSON 404 means no alerts", async () => {
  vi.stubGlobal("fetch", answer('{"error":"not found"}', { status: 404, headers: { "content-type": "application/json" } }));
  expect(await pushAvailable()).toBe(false);
});

test("push off with the SPA fallback: an HTML 200 means no alerts", async () => {
  vi.stubGlobal("fetch", answer("<!doctype html><html></html>", { status: 200, headers: { "content-type": "text/html" } }));
  expect(await pushAvailable()).toBe(false);
});

test("push on: a JSON 200 with a key means alerts", async () => {
  vi.stubGlobal("fetch", answer('{"key":"BKey"}', { status: 200, headers: { "content-type": "application/json" } }));
  expect(await pushAvailable()).toBe(true);
});
