import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";
import { loadToken } from "../../server/token.js";

const TOKEN = "s3cret-token";

async function appFor(world: Record<string, any>) {
  if (!world.app) {
    const { root } = await makeFixtureRoot();
    world.app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
  }
  return world.app as ReturnType<typeof createApp>;
}

async function get(world: Record<string, any>, url: string, token?: string) {
  const app = await appFor(world);
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {};
  world.res = await app.request(url, { headers });
}

export function accessSteps(steps: Steps) {
  steps.when(/^a client requests "([^"]+)" without a token$/, (w, url) => get(w, url));
  steps.when(/^a client requests "([^"]+)" with the token "([^"]+)"$/, (w, url, t) => get(w, url, t));
  steps.when(/^a client requests "([^"]+)" with the right token$/, (w, url) => get(w, url, TOKEN));
  steps.when(/^a client requests the note "([^"]+)" with the right token$/, (w, p) =>
    get(w, `/api/note?path=${encodeURIComponent(p)}`, TOKEN),
  );
  steps.when(/^a client requests the file "([^"]+)" with the right token$/, (w, p) =>
    get(w, `/api/file?path=${encodeURIComponent(p)}`, TOKEN),
  );
  steps.when(/^a client requests the file "([^"]+)" without a token$/, (w, p) =>
    get(w, `/api/file?path=${encodeURIComponent(p)}`),
  );
  steps.then(/^the file content type is "([^"]+)"$/, (w, t) => expect(w.res.headers.get("content-type")).toBe(t));
  steps.then(/^the file is sandboxed and not sniffable$/, (w) => {
    expect(w.res.headers.get("content-security-policy")).toMatch(/^sandbox/);
    expect(w.res.headers.get("x-content-type-options")).toBe("nosniff");
  });
  steps.then(/^the file body is "([^"]*)"$/, async (w, text) => expect(await w.res.text()).toBe(text));
  steps.then(/^the file is not served$/, (w) => expect(w.res.status).toBeGreaterThanOrEqual(400));
  steps.when(/^a client visits "([^"]+)"$/, async (w, url) => {
    const app = await appFor(w);
    w.res = await app.request(url);
  });
  steps.then(/^the response redirects to "([^"]+)"$/, (w, loc) => {
    expect(w.res.status).toBe(302);
    expect(w.res.headers.get("location")).toBe(loc);
  });
  steps.then(/^it sets an httpOnly cookie$/, (w) => {
    const cookie = w.res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    w.cookie = cookie.split(";")[0];
  });
  steps.then(/^it sets no cookie$/, (w) => {
    expect(w.res.headers.get("set-cookie") ?? "").not.toMatch(/mn_ui_token=[^;]/);
  });
  steps.then(/^a request carrying only that cookie gets status (\d+)$/, async (w, n) => {
    const res = await w.app.request("/api/version", { headers: { cookie: w.cookie } });
    expect(res.status).toBe(Number(n));
  });
  steps.when(/^the server loads a token from a missing token file$/, async (w) => {
    w.tokenFile = path.join(await mkdtemp(path.join(tmpdir(), "mn-ui-token-")), "ui", "token");
    w.token = await loadToken(w.tokenFile);
  });
  steps.then(/^the file holds a random token, mode 0600$/, async (w) => {
    expect((await readFile(w.tokenFile, "utf8")).trim()).toBe(w.token);
    expect(w.token.length).toBeGreaterThanOrEqual(24);
    expect((await stat(w.tokenFile)).mode & 0o777).toBe(0o600);
  });
  steps.then(/^loading again returns the same token$/, async (w) => {
    expect(await loadToken(w.tokenFile)).toBe(w.token);
  });
  steps.then(/^the response status is (\d+)$/, (w, n) => expect(w.res.status).toBe(Number(n)));
  steps.then(/^the note is served$/, (w) => expect(w.res.status).toBe(200));
  steps.then(/^the note is not served$/, async (w) => {
    expect(w.res.status).toBeGreaterThanOrEqual(400);
    expect(await w.res.text()).not.toContain("secret");
  });
}
