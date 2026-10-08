import { mkdtemp, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, expect } from "vitest";
import type { Steps } from "vitest-bridle";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";
import { startServer, UsageError, type RunningServer } from "../../server/start.js";

const TOKEN = "ui-token";
const HUMAN = "human-secret-token";
type World = Record<string, any>;

const servers: Server[] = [];
const running: RunningServer[] = [];
afterAll(() => {
  servers.forEach((s) => s.close());
  running.forEach((s) => s.close());
});

/** A fake bridle daemon on port 0 that records what it receives and answers `status` with `reply`. */
async function fakeDaemon(w: World, status: number, reply: string): Promise<string> {
  w.received = [];
  const server = createServer((req, res) => {
    let data = "";
    req.on("data", (d) => (data += d));
    req.on("end", () => {
      w.received.push({ method: req.method, url: req.url, auth: req.headers.authorization, body: JSON.parse(data || "{}") });
      res.writeHead(status, { "content-type": "application/json" });
      res.end(reply);
    });
  });
  servers.push(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

/** An app wired to the fake daemon, with a temp token file holding the human's token. */
async function appWithDaemon(w: World, status = 200, reply = "{}") {
  const url = await fakeDaemon(w, status, reply);
  const { root } = await makeFixtureRoot();
  w.tokenFile = path.join(await mkdtemp(path.join(tmpdir(), "mnui-human-")), "human");
  await writeFile(w.tokenFile, HUMAN + "\n");
  w.app = createApp({
    failDelayMs: 0,
    root,
    token: TOKEN,
    version: "0.0.0",
    subscribe: () => () => {},
    message: { url, tokenFile: w.tokenFile, to: "external:advisor" },
  });
}

function post(w: World, text: string, token: string | undefined = TOKEN) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  return w.app.request("/api/message", { method: "POST", headers, body: JSON.stringify({ body: text }) });
}

export function messageSteps(steps: Steps) {
  steps.when(/^a client asks for the version and posts a message to a server started without the bridle flags$/, async (w) => {
    const { root } = await makeFixtureRoot();
    const app = createApp({ failDelayMs: 0, root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
    const auth = { authorization: `Bearer ${TOKEN}` };
    w.version = await (await app.request("/api/version", { headers: auth })).json();
    w.res = await app.request("/api/message", { method: "POST", headers: auth, body: "{}" });
  });
  steps.then(/^the version reports message (true|false)$/, (w, v) => expect(w.version.message).toBe(v === "true"));
  steps.then(/^the post is answered 404$/, (w) => expect(w.res.status).toBe(404));

  steps.when(/^the server is started with --bridle-url but no --bridle-token-file$/, async (w) => {
    const { root } = await makeFixtureRoot();
    try {
      running.push(await startServer(["--root", root, "--token-file", path.join(root, ".meta-notes-cache", "ui", "token"), "--bridle-url", "http://127.0.0.1:1"]));
    } catch (err) {
      w.error = err;
    }
  });
  steps.then(/^it fails with a usage error$/, (w) => expect(w.error).toBeInstanceOf(UsageError));

  steps.when(/^a client posts the message "([^"]*)" with a fake daemon that accepts it$/, async (w, text) => {
    await appWithDaemon(w);
    w.res = await post(w, text);
  });
  steps.when(/^a client posts the message "([^"]*)" with a fake daemon that answers (\d+) "([^"]*)"$/, async (w, text, status, err) => {
    await appWithDaemon(w, Number(status), JSON.stringify({ error: err }));
    w.res = await post(w, text);
  });
  steps.when(/^a client posts the message "([^"]*)" without a token to a server with a fake daemon$/, async (w, text) => {
    await appWithDaemon(w);
    w.res = await post(w, text, "");
  });
  steps.when(/^the token file changes to "([^"]*)" and a client posts the message "([^"]*)"$/, async (w, token, text) => {
    await appWithDaemon(w);
    await writeFile(w.tokenFile, token);
    w.res = await post(w, text);
  });
  steps.then(/^the daemon received "([^"]*)" for "([^"]*)" with the (human's token|token "([^"]*)")$/, (w, text, to, _who, token) => {
    expect(w.received).toHaveLength(1);
    const r = w.received[0];
    expect(r.method).toBe("POST");
    expect(r.url).toBe("/v1/messages");
    expect(r.auth).toBe(`Bearer ${token ?? HUMAN}`);
    expect(r.body).toEqual({ to, body: text });
  });
  steps.then(/^the daemon received nothing$/, (w) => expect(w.received).toHaveLength(0));
  steps.then(/^the response error is "([^"]*)" and does not contain the token$/, async (w, err) => {
    const raw = await w.res.text();
    expect(JSON.parse(raw).error).toBe(err);
    expect(raw).not.toContain(HUMAN);
  });
}
