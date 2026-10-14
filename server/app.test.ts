import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { makeFixtureRoot } from "./fixture.js";
import { tokenMatches } from "./token.js";

const TOKEN = "s3cret-token";
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  const { root } = await makeFixtureRoot();
  app = createApp({
    root,
    token: TOKEN,
    version: "9.9.9",
    subscribe: () => () => {},
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
    expect(await res.json()).toEqual({ version: "9.9.9", login: false, message: false });
  });

  // Push is off here (no push contact): these paths are unmatched, so they must be JSON 404s, not index.html.
  it.each(["/api/push/key", "/api/nonexistent"])("answers %s with a JSON 404 when push is off", async (url) => {
    const res = await app.request(url, { headers: auth });
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ error: "not found" });
  });
});
