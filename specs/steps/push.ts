import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { expect, vi } from "vitest";
import type { Steps } from "vitest-bridle";
import type { PushSubscriptionJSON, TodayTask } from "../../shared/types.js";
import { createApp } from "../../server/app.js";
import { makeFixtureRoot } from "../../server/fixture.js";
import { createPush, type PushStore } from "../../server/push.js";
import { createScheduler, type Inputs, type Scheduler } from "../../server/scheduler.js";
import { startServer, UsageError, type RunningServer } from "../../server/start.js";

const TOKEN = "push-token";
const CONTACT = "mailto:you@example.com";
type World = Record<string, any>;

const running: RunningServer[] = [];
// The real setTimeout, taken before any test fakes it: file writes need real event-loop turns.
const realSetTimeout = setTimeout;
const realWait = (ms: number) => new Promise<void>((r) => realSetTimeout(r, ms));

const task = (line: number, time: string): TodayTask => ({
  file: "a.md",
  line,
  text: `- [ ] Call the dentist ⏰ ${time} 📅 2026-10-04`,
  due: "2026-10-04",
  time,
});

const device = (n: number): PushSubscriptionJSON => ({ endpoint: `https://push.example/${n}`, keys: { p256dh: "p", auth: "a" } });

interface Push {
  endpoint: string;
  at: number;
  payload: { title: string; tag: string };
}

/** A fixture root with a push store (fake sender: records, no network) and a scheduler over `w.inputs`. */
async function boot(w: World, devices: number, tasks: TodayTask[] = []) {
  if (!w.root) {
    w.root = (await makeFixtureRoot()).root;
    w.pushes = [] as Push[];
    w.status = {} as Record<string, number>;
    w.inputs = { tasks, daily: "" } as Inputs;
  }
  const store: PushStore = await createPush({
    root: w.root,
    contact: CONTACT,
    retryMs: 60_000,
    sender: async (sub, payload) => {
      w.pushes.push({ endpoint: sub.endpoint, at: Date.now(), payload: JSON.parse(payload) });
      return w.status[sub.endpoint] ?? 201;
    },
  });
  for (let i = 1; i <= devices; i++) await store.subscribe(device(i), "test");
  const sched: Scheduler = createScheduler(store, async () => w.inputs);
  w.store = store;
  w.sched = sched;
  await sched.replan();
  await realWait(5);
}

/** Run `fn` with the clock faked at 2026-10-04 `h:m` (timers and Date only), always restoring it. */
async function withClock(h: number, m: number, fn: () => Promise<void>) {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date(2026, 9, 4, h, m));
  try {
    await fn();
  } finally {
    vi.useRealTimers();
  }
}

/** Advance the fake clock to `h:m` a minute at a time, letting the file writes between timers finish. */
async function runTo(h: number, m: number) {
  const target = new Date(2026, 9, 4, h, m).getTime();
  while (Date.now() < target) {
    await vi.advanceTimersByTimeAsync(60_000);
    await realWait(5);
  }
}

function stop(w: World) {
  w.sched?.stop();
  w.store?.stop();
}

function api(app: ReturnType<typeof createApp>, method: string, url: string, body?: unknown, token = TOKEN) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  return app.request(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

export function pushSteps(steps: Steps) {
  steps.when(/^a client asks for the push key of a server started without a push contact$/, async (w) => {
    const { root } = await makeFixtureRoot();
    const app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {} });
    w.res = await api(app, "GET", "/api/push/key");
  });
  steps.then(/^the push key request is answered 404 with the JSON body \{"error":"not found"\}$/, async (w) => {
    expect(w.res.status).toBe(404);
    expect(w.res.headers.get("content-type")).toContain("application/json");
    expect(await w.res.json()).toEqual({ error: "not found" });
  });

  steps.when(/^the server is started with the push contact "([^"]*)"$/, async (w, contact) => {
    const { root } = await makeFixtureRoot();
    try {
      running.push(await startServer(["--root", root, "--token-file", path.join(root, ".meta-notes-cache", "ui", "token"), "--push-contact", contact]));
    } catch (err) {
      w.error = err;
    }
  });
  steps.then(/^it fails with a usage error$/, (w) => expect(w.error).toBeInstanceOf(UsageError));

  steps.when(/^a server is started with a push contact and a client asks for the push key$/, async (w) => {
    const { root } = await makeFixtureRoot();
    const tokenFile = path.join(root, ".meta-notes-cache", "ui", "token");
    const server = await startServer(["--root", root, "--token-file", tokenFile, "--push-contact", CONTACT]);
    running.push(server);
    const token = (await readFile(tokenFile, "utf8")).trim();
    const res = await fetch(`${server.info.url}/api/push/key`, { headers: { authorization: `Bearer ${token}` } });
    w.keyText = await res.text();
    w.vapidFile = path.join(root, ".meta-notes-cache", "ui", "push", "vapid.json");
  });
  steps.then(/^the key file is mode 0600 and the answer holds its public key but not its private key$/, async (w) => {
    expect((await stat(w.vapidFile)).mode & 0o777).toBe(0o600);
    const vapid = JSON.parse(await readFile(w.vapidFile, "utf8"));
    expect(JSON.parse(w.keyText).key).toBe(vapid.publicKey);
    expect(w.keyText).not.toContain(vapid.privateKey);
    running.forEach((s) => s.close());
  });

  steps.when(/^a client posts a subscription without the token and then with it, posts the same one again, and deletes it$/, async (w) => {
    const { root } = await makeFixtureRoot();
    const store = await createPush({ root, contact: CONTACT, sender: async () => 201 });
    const app = createApp({ root, token: TOKEN, version: "0.0.0", subscribe: () => () => {}, push: { store, onSubscribed: () => {} } });
    const sub = device(1);
    w.first = (await api(app, "POST", "/api/push/subscribe", sub, "")).status;
    w.second = (await api(app, "POST", "/api/push/subscribe", sub)).status;
    w.afterSecond = store.count();
    await api(app, "POST", "/api/push/subscribe", sub);
    w.afterRepeat = store.count();
    await api(app, "DELETE", "/api/push/subscribe", { endpoint: sub.endpoint });
    w.afterDelete = store.count();
  });
  steps.then(/^the first post is refused, the second stored one subscription, the repeat still one, and the delete none$/, (w) => {
    expect([w.first, w.second, w.afterSecond, w.afterRepeat, w.afterDelete]).toEqual([401, 200, 1, 1, 0]);
  });

  steps.when(/^a device is subscribed, the notes hold a task at 09:30 and the clock runs from 08:00 to 10:30$/, async (w) => {
    await withClock(8, 0, async () => {
      await boot(w, 1, [task(3, "09:30")]);
      await runTo(10, 30);
      stop(w);
    });
  });
  steps.then(/^one push is sent at 09:30 with the tag "([^"]+)" and the title "([^"]+)"$/, (w, tag, title) => {
    expect(w.pushes).toHaveLength(1);
    expect(w.pushes[0].payload.tag).toBe(tag);
    expect(w.pushes[0].payload.title).toBe(title);
    expect(w.pushes[0].at).toBe(new Date(2026, 9, 4, 9, 30).getTime());
  });

  steps.when(/^two devices are subscribed, the notes hold a task at 09:30 and the clock runs from 08:00 to 10:30$/, async (w) => {
    await withClock(8, 0, async () => {
      await boot(w, 2, [task(3, "09:30")]);
      await runTo(10, 30);
      stop(w);
    });
  });
  steps.then(/^each device is sent the same tag "([^"]+)"$/, (w, tag) => {
    expect(w.pushes.map((p: Push) => p.endpoint).sort()).toEqual([device(1).endpoint, device(2).endpoint]);
    for (const p of w.pushes) expect(p.payload.tag).toBe(tag);
  });

  steps.when(/^the alert at 09:30 was sent, the server restarts at 09:40 and the clock runs on to 10:30$/, async (w) => {
    await withClock(8, 0, async () => {
      await boot(w, 1, [task(3, "09:30")]);
      await runTo(9, 40);
      stop(w);
      await boot(w, 0);
      await runTo(10, 30);
      stop(w);
    });
  });
  steps.then(/^one push was sent in all$/, (w) => expect(w.pushes).toHaveLength(1));

  steps.when(/^the task at 09:30 is edited to 10:00 at 08:30, a change is reported, and the clock runs to 10:30$/, async (w) => {
    await withClock(8, 0, async () => {
      await boot(w, 1, [task(3, "09:30")]);
      await runTo(8, 30);
      w.inputs = { tasks: [task(3, "10:00")], daily: "" };
      w.sched.onChanges([{ type: "changed", path: "a.md" }]);
      await runTo(10, 30);
      stop(w);
    });
  });
  steps.then(/^one push is sent, with the title "([^"]+)"$/, (w, title) => {
    expect(w.pushes.map((p: Push) => p.payload.title)).toEqual([title]);
  });

  steps.when(/^the server starts at 09:39 with tasks at 09:30 and 09:09$/, async (w) => {
    await withClock(9, 39, async () => {
      await boot(w, 1, [task(3, "09:30"), task(4, "09:09")]);
      stop(w);
    });
  });
  steps.then(/^one push is sent now, with the title "([^"]+)", and the 09:09 one is skipped$/, (w, title) => {
    expect(w.pushes.map((p: Push) => p.payload.title)).toEqual([title]);
    expect(w.sched.pending()).toEqual([]);
  });

  steps.when(/^a push is sent to a subscription the push service answers 410 to$/, async (w) => {
    await boot(w, 1);
    w.status[device(1).endpoint] = 410;
    w.result = await w.store.sendPush({ title: "x", tag: "t" });
    w.left = JSON.parse(await readFile(path.join(w.root, ".meta-notes-cache/ui/push/subscriptions.json"), "utf8"));
    stop(w);
  });
  steps.then(/^one subscription is removed and none remain$/, (w) => {
    expect(w.result.removed).toBe(1);
    expect(w.store.count()).toBe(0);
    expect(Object.keys(w.left)).toEqual([]);
  });
}
