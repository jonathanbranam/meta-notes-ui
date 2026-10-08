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
    expect(await res.json()).toEqual({ version: "9.9.9", login: false });
  });
});
