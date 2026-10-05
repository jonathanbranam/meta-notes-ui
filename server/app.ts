import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import type { BacklinksResponse, ChangeEvent, NoteResponse } from "../shared/types.js";
import { createBacklinks } from "./backlinks.js";
import { editRoutes } from "./edits.js";
import { confine, PathError } from "./paths.js";
import { tokenMatches } from "./token.js";
import { listTree } from "./tree.js";
import { todayRoutes } from "./today.js";

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
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".map": "application/json",
};

/** Content types of the notes root's files; anything else is downloaded as bytes. */
const FILE_MIME: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

const SCRIPTABLE = new Set([".html", ".htm", ".svg"]);

export function createApp(opts: AppOptions): Hono {
  const { root, token } = opts;
  const app = new Hono();
  const backlinks = createBacklinks(root);

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

  // Any visible file, raw. HTML and SVG could run script in the UI's origin, so they get a sandbox.
  app.get("/api/file", async (c) => {
    const rel = c.req.query("path") ?? "";
    try {
      const abs = await confine(root, rel);
      if (!(await stat(abs)).isFile()) return c.json({ error: "not a file" }, 400);
      const data = await readFile(abs);
      const ext = path.extname(abs).toLowerCase();
      const headers: Record<string, string> = {
        "content-type": FILE_MIME[ext] ?? "application/octet-stream",
        "x-content-type-options": "nosniff",
      };
      // Not for PDFs: a sandbox stops the browser's PDF viewer.
      if (SCRIPTABLE.has(ext)) headers["content-security-policy"] = "sandbox; default-src 'none'; style-src 'unsafe-inline'";
      return c.body(new Uint8Array(data), 200, headers);
    } catch (e) {
      if (e instanceof PathError) return c.json({ error: e.message }, e.message === "not found" ? 404 : 403);
      return c.json({ error: "cannot read" }, 404);
    }
  });

  app.get("/api/backlinks", async (c) => {
    const rel = c.req.query("path") ?? "";
    if (!rel.endsWith(".md")) return c.json({ error: "not a note" }, 400);
    const body: BacklinksResponse = { backlinks: await backlinks(rel, await listTree(root)) };
    return c.json(body);
  });

  // Today's daily note path, from the meta-notes CLI, and whether it exists (--render never creates it).
  app.get("/api/daily", async (c) => {
    try {
      const { stdout } = await exec("meta-notes", ["note", "daily", "--render", "--root", root, "--json"]);
      const out = JSON.parse(stdout) as { path?: string; exists?: boolean };
      return out.path ? c.json({ path: out.path, exists: out.exists === true }) : c.json({ error: "no path" }, 502);
    } catch {
      return c.json({ error: "meta-notes failed" }, 502);
    }
  });

  editRoutes(app, root);
  todayRoutes(app, root);

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
