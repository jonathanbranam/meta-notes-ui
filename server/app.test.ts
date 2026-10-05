import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { makeFixtureRoot } from "./fixture.js";
import { tokenMatches } from "./token.js";
import type { ChangeEvent } from "../shared/types.js";

const TOKEN = "s3cret-token";
let app: ReturnType<typeof createApp>;
const listeners = new Set<(e: ChangeEvent[]) => void>();

beforeAll(async () => {
  const { root } = await makeFixtureRoot();
  app = createApp({
    root,
    token: TOKEN,
    version: "9.9.9",
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  });
});

const auth = { authorization: `Bearer ${TOKEN}` };

describe("tokenMatches", () => {
  it("accepts only the exact token", () => {
    expect(tokenMatches("abc", "abc")).toBe(true);
    expect(tokenMatches("abc", "abd")).toBe(false);
    expect(tokenMatches("abc", "")).toBe(false);
    expect(tokenMatches("abc", undefined)).toBe(false);
  });
});

describe("api", () => {
  it("returns the version", async () => {
    const res = await app.request("/api/version", { headers: auth });
    expect(await res.json()).toEqual({ version: "9.9.9" });
  });
  it("returns the tree", async () => {
    const res = await app.request("/api/tree", { headers: auth });
    const tree = (await res.json()) as { name: string }[];
    expect(tree[0].name).toBe("plan");
  });
  it("returns a note's text and mtime", async () => {
    const res = await app.request("/api/note?path=area/health.md", { headers: auth });
    const body = (await res.json()) as { text: string; mtime: number };
    expect(body.text).toBe("# Health\n");
    expect(body.mtime).toBeGreaterThan(0);
  });
  it("lists backlinks, folder notes included", async () => {
    const get = async (p: string) =>
      ((await (await app.request(`/api/backlinks?path=${p}`, { headers: auth })).json()) as { backlinks: string[] }).backlinks;
    expect(await get("area/health.md")).toEqual(["root.md"]);
    expect(await get("project/make-bread/Home.md")).toEqual(["root.md"]);
    expect(await get("zeta/z.md")).toEqual([]);
  });
  it("streams events to subscribers", async () => {
    const res = await app.request("/api/events", { headers: auth });
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let text = dec.decode((await reader.read()).value);
    while (listeners.size === 0) await new Promise((r) => setImmediate(r));
    listeners.forEach((fn) => fn([{ type: "changed", path: "root.md" }]));
    while (!text.includes("root.md")) text += dec.decode((await reader.read()).value);
    expect(text).toContain('data: {"type":"changed","path":"root.md"}');
    await reader.cancel();
  });
});
