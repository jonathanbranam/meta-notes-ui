import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import webpush from "web-push";
import type { PushPayload, PushResult, PushSubscriptionJSON } from "../shared/types.js";

/** Delivers one encrypted message to one subscription; resolves with the push service's HTTP status (0 when it could not be reached). */
export type Sender = (sub: PushSubscriptionJSON, payload: string) => Promise<number>;

export interface PushStore {
  /** The VAPID public key the page subscribes with. */
  publicKey: string;
  count: () => number;
  /** Add or replace a subscription (keyed by endpoint). */
  subscribe: (sub: PushSubscriptionJSON, userAgent: string) => Promise<void>;
  unsubscribe: (endpoint: string) => Promise<void>;
  /** Send to every stored subscription; delete the gone ones; retry transient failures. */
  sendPush: (p: PushPayload) => Promise<PushResult>;
  /** Alerts already sent, by id and alert time; kept on disk so a restart never resends. */
  wasSent: (id: string, at: number) => boolean;
  markSent: (id: string, at: number) => Promise<void>;
  stop: () => void;
}

export interface PushOptions {
  root: string;
  /** VAPID subject: a `mailto:` or `https:` URL. */
  contact: string;
  sender?: Sender;
  /** Wait between retries of a transient failure; default one minute. */
  retryMs?: number;
}

const RETRIES = 3;
const DAY_MS = 86_400_000;

/** Subject must be a mailto: or https: URL (Apple rejects pushes without one). */
export function validContact(s: string): boolean {
  return /^mailto:[^\s@]+@[^\s@]+$/.test(s) || /^https:\/\/\S+$/.test(s);
}

const realSender = (contact: string, publicKey: string, privateKey: string): Sender => async (sub, payload) => {
  try {
    const res = await webpush.sendNotification(sub, payload, { vapidDetails: { subject: contact, publicKey, privateKey }, TTL: 3600 });
    return res.statusCode;
  } catch (e) {
    return (e as { statusCode?: number }).statusCode ?? 0;
  }
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Write through a temp file so a crash never leaves half a file; mode 0600 (the keys are in here). */
async function writeJson(file: string, value: unknown): Promise<void> {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  await rename(tmp, file);
}

/**
 * Keys, subscriptions and the sent list, under `<root>/.meta-notes-cache/ui/push/` (git-ignored, beside the
 * token). The VAPID key pair is made on first use.
 */
export async function createPush(opts: PushOptions): Promise<PushStore> {
  const dir = path.join(opts.root, ".meta-notes-cache", "ui", "push");
  await mkdir(dir, { recursive: true });
  const vapidFile = path.join(dir, "vapid.json");
  const subsFile = path.join(dir, "subscriptions.json");
  const sentFile = path.join(dir, "sent.json");

  let keys = await readJson<{ publicKey: string; privateKey: string } | null>(vapidFile, null);
  if (!keys?.publicKey || !keys.privateKey) {
    keys = webpush.generateVAPIDKeys();
    await writeJson(vapidFile, keys);
  }
  await chmod(vapidFile, 0o600);

  const subs = await readJson<Record<string, { sub: PushSubscriptionJSON; created: string; device: string }>>(subsFile, {});
  const sent = await readJson<Record<string, number>>(sentFile, {});
  for (const [id, at] of Object.entries(sent)) if (at < Date.now() - DAY_MS) delete sent[id];

  const send = opts.sender ?? realSender(opts.contact, keys.publicKey, keys.privateKey);
  const retryMs = opts.retryMs ?? 60_000;
  const retries = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;

  /** One delivery; true if it is settled (sent or the subscription is gone), false to retry. */
  async function deliver(sub: PushSubscriptionJSON, payload: string): Promise<"sent" | "gone" | "failed"> {
    const status = await send(sub, payload);
    if (status >= 200 && status < 300) return "sent";
    if (status === 404 || status === 410) {
      delete subs[sub.endpoint];
      await writeJson(subsFile, subs);
      return "gone";
    }
    return "failed";
  }

  function retryLater(sub: PushSubscriptionJSON, payload: string, attempt: number): void {
    if (stopped || attempt > RETRIES) return;
    const t = setTimeout(async () => {
      retries.delete(t);
      if (!subs[sub.endpoint]) return;
      if ((await deliver(sub, payload)) === "failed") retryLater(sub, payload, attempt + 1);
    }, retryMs);
    retries.add(t);
  }

  return {
    publicKey: keys.publicKey,
    count: () => Object.keys(subs).length,
    async subscribe(sub, userAgent) {
      const old = subs[sub.endpoint];
      subs[sub.endpoint] = { sub, created: old?.created ?? new Date().toISOString().slice(0, 10), device: userAgent.slice(0, 80) };
      await writeJson(subsFile, subs);
    },
    async unsubscribe(endpoint) {
      delete subs[endpoint];
      await writeJson(subsFile, subs);
    },
    async sendPush(p) {
      const payload = JSON.stringify(p);
      const out: PushResult = { sent: 0, removed: 0, failed: 0 };
      await Promise.all(
        Object.values(subs).map(async ({ sub }) => {
          const r = await deliver(sub, payload);
          if (r === "sent") out.sent++;
          else if (r === "gone") out.removed++;
          else {
            out.failed++;
            retryLater(sub, payload, 1);
          }
        }),
      );
      return out;
    },
    wasSent: (id, at) => sent[id] === at,
    async markSent(id, at) {
      sent[id] = at;
      await writeJson(sentFile, sent);
    },
    stop() {
      stopped = true;
      retries.forEach(clearTimeout);
    },
  };
}
