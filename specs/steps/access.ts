import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";
import { startServer, UsageError, type RunningServer } from "../../server/start.js";
import { createLogin, loginFile } from "../../server/login.js";
import { loadToken } from "../../server/token.js";

const TOKEN = "s3cret-token";

const started: RunningServer[] = [];
afterAll(() => started.forEach((s) => s.close()));

/** A client build directory with a secret file next to it (outside it). */
async function makeClientDir(): Promise<string> {
  const base = await mkdtemp(path.join(tmpdir(), "mnui-client-"));
  const dir = path.join(base, "client");
  await mkdir(dir);
  await writeFile(path.join(dir, "index.html"), "<html>client</html>");
  await writeFile(path.join(base, "outside.txt"), "secret outside the client");
  return dir;
}

async function appFor(world: Record<string, any>) {
  if (!world.app) {
    const { root } = await makeFixtureRoot();
    world.root = root;
    world.app = createApp({
      failDelayMs: 0,
      root,
      token: TOKEN,
      version: "0.0.0",
      clientDir: await makeClientDir(),
      subscribe: () => () => {},
    });
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
    expect([302, 303]).toContain(w.res.status);
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
  steps.given(/^a login "([^"]+)" with password "([^"]+)"$/, async (w, user, pass) => {
    await appFor(w);
    await createLogin(w.root, user, pass);
  });
  steps.when(/^a client logs in as "([^"]+)" with password "([^"]+)"$/, async (w, user, pass) => {
    const app = await appFor(w);
    w.res = await app.request("/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: user, password: pass }),
    });
    const m = /mn_ui_session=([^;]+)/.exec(w.res.headers.get("set-cookie") ?? "");
    if (m) w.session = `mn_ui_session=${m[1]}`;
  });
  steps.then(/^the session cookie is HttpOnly and SameSite=Lax$/, (w) => {
    const cookie = w.res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });
  steps.then(/^it sets no session cookie$/, (w) => {
    expect(w.res.headers.get("set-cookie") ?? "").not.toContain("mn_ui_session=");
  });
  steps.then(/^a request carrying only that session gets status (\d+)$/, async (w, n) => {
    const res = await w.app.request("/api/version", { headers: { cookie: w.session } });
    expect(res.status).toBe(Number(n));
  });
  steps.when(/^the client logs out$/, async (w) => {
    w.res = await w.app.request("/logout", { method: "POST", headers: { cookie: w.session } });
  });
  steps.when(/^the login is set again as "([^"]+)" with password "([^"]+)"$/, (w, user, pass) =>
    createLogin(w.root, user, pass),
  );
  steps.then(/^the login file is mode 0600 and does not contain "([^"]+)"$/, async (w, pass) => {
    const file = loginFile(w.root);
    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect(await readFile(file, "utf8")).not.toContain(pass);
  });
  steps.then(/^the response status is (\d+)$/, (w, n) => expect(w.res.status).toBe(Number(n)));
  steps.then(/^the note is served$/, (w) => expect(w.res.status).toBe(200));
  steps.then(/^the note is not served$/, async (w) => {
    expect(w.res.status).toBeGreaterThanOrEqual(400);
    expect(await w.res.text()).not.toContain("secret");
  });

  steps.when(/^a client requests the client file "([^"]+)" without a token$/, (w, url) => get(w, url));
  steps.when(/^a client requests the client file "([^"]+)" with the right token$/, (w, url) => get(w, url, TOKEN));
  steps.then(/^the client file is served$/, async (w) => {
    expect(w.res.status).toBe(200);
    expect(await w.res.text()).toBe("<html>client</html>");
  });
  steps.then(/^no file outside the client directory is served$/, async (w) => {
    expect(await w.res.text()).not.toContain("secret");
  });

  async function start(w: Record<string, any>, extra: string[]) {
    const { root } = await makeFixtureRoot();
    w.root = root;
    const tokenFile = path.join(root, ".meta-notes-cache", "ui", "token");
    try {
      w.running = await startServer(["--root", root, "--token-file", tokenFile, ...extra]);
      started.push(w.running);
    } catch (err) {
      w.error = err;
    }
  }
  const infoOf = async (w: Record<string, any>) => JSON.parse(await readFile(w.running.infoFile, "utf8"));

  steps.when(/^the server is started without a token file$/, async (w) => {
    try {
      await startServer(["--root", (await makeFixtureRoot()).root]);
    } catch (err) {
      w.error = err;
    }
  });
  steps.then(/^it fails with a usage error, which the entry point prints before exiting with status 2$/, (w) => {
    expect(w.error).toBeInstanceOf(UsageError);
    expect(w.error.message).toMatch(/^usage: .*--root.*--token-file/);
  });
  steps.when(/^the server is started on a notes root with port 0$/, (w) => start(w, ["--port", "0"]));
  steps.then(/^the info file holds the pid, host, the chosen port, the url and the version$/, async (w) => {
    const info = await infoOf(w);
    expect(w.error).toBeUndefined();
    expect(info.pid).toBe(process.pid);
    expect(info.host).toBe("127.0.0.1");
    expect(info.port).toBeGreaterThan(0);
    expect(info.url).toBe(`http://127.0.0.1:${info.port}`);
    expect(info.version).toMatch(/^\d+\.\d+\.\d+/);
  });
  steps.when(/^the running server is stopped, as SIGINT and SIGTERM do$/, async (w) => {
    await start(w, []);
    expect((await stat(w.running.infoFile)).isFile()).toBe(true);
    w.running.close();
  });
  steps.then(/^the info file is gone$/, async (w) => {
    await expect(stat(w.running.infoFile)).rejects.toThrow();
  });
  steps.when(/^the server is started without a host$/, (w) => start(w, []));
  steps.when(/^the server is started with host "([^"]+)"$/, (w, host) => start(w, ["--host", host]));
  steps.then(/^it listens on 127\.0\.0\.1 and the info file host is "([^"]+)"$/, async (w, host) => {
    expect(w.error).toBeUndefined();
    const info = await infoOf(w);
    expect(info.host).toBe(host);
    const res = await fetch(`http://127.0.0.1:${info.port}/api/version`);
    expect(res.status).toBe(401);
  });
  steps.then(/^it listens on that address and the info file url starts with "([^"]+)"$/, async (w, prefix) => {
    expect(w.error).toBeUndefined();
    const info = await infoOf(w);
    expect(info.url.startsWith(prefix)).toBe(true);
    expect((await fetch(`${info.url}/api/version`)).status).toBe(401);
  });
}
