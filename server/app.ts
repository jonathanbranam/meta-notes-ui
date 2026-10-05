import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import type { ChangeEvent, NoteResponse } from "../shared/types.js";
import { confine, PathError } from "./paths.js";
import { tokenMatches } from "./token.js";
import { listTree } from "./tree.js";

const exec = promisify(execFile);
export const COOKIE = "mn_ui_token";

export interface AppOptions {
  /** Real path of the notes root. */
  root: string;
  token: string;
  version: string;
  /** Static client build; omitted in tests. */
  clientDir?: string;
  /** Subscribe to change batches; returns an unsubscribe function. */
  subscribe: (fn: (events: ChangeEvent[]) => void) => () => void;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".map": "application/json",
};

export function createApp(opts: AppOptions): Hono {
  const { root, token } = opts;
  const app = new Hono();

  // Token on every request: cookie, or `Authorization: Bearer`. `GET /?token=` trades it for the cookie.
  app.use("*", async (c, next) => {
    const url = new URL(c.req.url);
    const bearer = c.req.header("authorization")?.replace(/^Bearer /i, "");
    if (c.req.method === "GET" && url.pathname === "/" && url.searchParams.has("token")) {
      if (!tokenMatches(token, url.searchParams.get("token") ?? "")) return c.text("unauthorized", 401);
      setCookie(c, COOKIE, token, {
        httpOnly: true,
        sameSite: "Strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return c.redirect("/");
    }
    if (!tokenMatches(token, getCookie(c, COOKIE)) && !tokenMatches(token, bearer)) {
      deleteCookie(c, COOKIE);
      return c.text("unauthorized", 401);
    }
    await next();
  });

  app.get("/api/version", (c) => c.json({ version: opts.version }));

  app.get("/api/tree", async (c) => c.json(await listTree(root)));

  app.get("/api/note", async (c) => {
    const rel = c.req.query("path") ?? "";
    if (!rel.endsWith(".md")) return c.json({ error: "not a note" }, 400);
    try {
      const abs = await confine(root, rel);
      const [text, st] = await Promise.all([readFile(abs, "utf8"), stat(abs)]);
      const body: NoteResponse = { path: rel, text, mtime: st.mtimeMs };
      return c.json(body);
    } catch (e) {
      if (e instanceof PathError) return c.json({ error: e.message }, e.message === "not found" ? 404 : 403);
      return c.json({ error: "cannot read" }, 404);
    }
  });

  // Today's daily note path, from the meta-notes CLI.
  app.get("/api/daily", async (c) => {
    try {
      const { stdout } = await exec("meta-notes", ["note", "daily", "--root", root, "--json"]);
      const out = JSON.parse(stdout) as { path?: string };
      return out.path ? c.json({ path: out.path }) : c.json({ error: "no path" }, 502);
    } catch {
      return c.json({ error: "meta-notes failed" }, 502);
    }
  });

  app.get("/api/events", (c) =>
    streamSSE(c, async (stream) => {
      let done!: () => void;
      const closed = new Promise<void>((r) => (done = r));
      const unsubscribe = opts.subscribe((events) => {
        for (const e of events) void stream.writeSSE({ data: JSON.stringify(e) }).catch(done);
      });
      stream.onAbort(done);
      await stream.writeSSE({ event: "ready", data: "{}" });
      await closed;
      unsubscribe();
    }),
  );

  // Built client, with index.html as the fallback.
  app.get("*", async (c) => {
    if (!opts.clientDir) return c.text("not found", 404);
    const rel = new URL(c.req.url).pathname.replace(/^\/+/, "") || "index.html";
    const abs = path.resolve(opts.clientDir, rel);
    const inside = !path.relative(opts.clientDir, abs).startsWith("..");
    for (const file of inside ? [abs, path.join(opts.clientDir, "index.html")] : []) {
      try {
        const data = await readFile(file);
        return c.body(new Uint8Array(data), 200, {
          "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
        });
      } catch {
        // try the fallback
      }
    }
    return c.text("not found", 404);
  });

  return app;
}
