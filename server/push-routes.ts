import type { Hono } from "hono";
import type { PushSubscriptionJSON } from "../shared/types.js";
import type { PushStore } from "./push.js";

export interface PushConfig {
  store: PushStore;
  /** Called after a subscription is added, so the scheduler plans for the new device. */
  onSubscribed: () => void;
}

const isStr = (v: unknown): v is string => typeof v === "string" && v !== "";

function parseSub(b: unknown): PushSubscriptionJSON | null {
  const o = b as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  if (!o || !isStr(o.endpoint) || !isStr(o.keys?.p256dh) || !isStr(o.keys?.auth)) return null;
  if (!/^https:\/\//.test(o.endpoint)) return null;
  return { endpoint: o.endpoint, keys: { p256dh: o.keys.p256dh, auth: o.keys.auth } };
}

/** `GET /api/push/key`, `POST` and `DELETE /api/push/subscribe`. Behind the same access check as every route. */
export function pushRoutes(app: Hono, cfg: PushConfig): void {
  app.get("/api/push/key", (c) => c.json({ key: cfg.store.publicKey }));
  app.post("/api/push/subscribe", async (c) => {
    const sub = parseSub(await c.req.json().catch(() => null));
    if (!sub) return c.json({ ok: false, error: "Not a push subscription" }, 400);
    await cfg.store.subscribe(sub, c.req.header("user-agent") ?? "");
    cfg.onSubscribed();
    return c.json({ ok: true });
  });
  app.delete("/api/push/subscribe", async (c) => {
    const b = (await c.req.json().catch(() => ({}))) as { endpoint?: unknown };
    if (!isStr(b.endpoint)) return c.json({ ok: false, error: "No endpoint" }, 400);
    await cfg.store.unsubscribe(b.endpoint);
    return c.json({ ok: true });
  });
}
