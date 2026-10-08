import { readFile } from "node:fs/promises";
import type { Hono } from "hono";

/** Where and as whom to send: the notes daemon, the human's token file, the recipient. */
export interface MessageConfig {
  url: string;
  tokenFile: string;
  to: string;
}

/** Text of a daemon error body (`{error}` JSON or plain text); never the token. */
function errorText(raw: string, status: number): string {
  try {
    const j = JSON.parse(raw);
    const e = j?.error ?? j?.message;
    if (typeof e === "string" && e) return e;
    if (e && typeof e.message === "string") return e.message;
  } catch {
    // not JSON
  }
  return raw.trim().slice(0, 500) || `the daemon answered ${status}`;
}

/** POST /api/message {body}: send it to the daemon as the human, reading the token file on each send. */
export function messageRoutes(app: Hono, cfg: MessageConfig): void {
  app.post("/api/message", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const body = typeof b.body === "string" ? b.body.trim() : "";
    if (!body) return c.json({ ok: false, error: "The message is empty" }, 400);
    try {
      const token = (await readFile(cfg.tokenFile, "utf8")).trim();
      const res = await fetch(`${cfg.url.replace(/\/+$/, "")}/v1/messages`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: cfg.to, body }),
      });
      if (!res.ok) return c.json({ ok: false, error: errorText(await res.text(), res.status) }, 502);
      return c.json({ ok: true });
    } catch {
      return c.json({ ok: false, error: "Cannot reach the notes daemon" }, 502);
    }
  });
}
