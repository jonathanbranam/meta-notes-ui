import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { streamSSE } from "hono/streaming";
import type { BacklinksResponse, ChangeEvent, NoteResponse, TagAliasesResponse } from "../shared/types.js";
import { createBacklinks } from "./backlinks.js";
import { editRoutes, runMetaNotes } from "./edits.js";
import { messageRoutes, type MessageConfig } from "./message.js";
import { confine, PathError } from "./paths.js";
import { createLoginStore, SESSION_MS, verifyLogin, type LoginStore } from "./login.js";
import { tokenMatches } from "./token.js";
import { listTree } from "./tree.js";
import { todayRoutes } from "./today.js";

const exec = promisify(execFile);
export const COOKIE = "mn_ui_token";
export const SESSION_COOKIE = "mn_ui_session";

const loginPage = (error: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>meta-notes login</title>
<style>body{font:16px system-ui,sans-serif;max-width:20rem;margin:20vh auto;padding:0 1rem}
input,button{display:block;width:100%;box-sizing:border-box;margin:.5rem 0;padding:.6rem;font:inherit}
.error{color:#b00020}</style></head><body>
<h1>meta-notes</h1>${error ? `<p class="error">${error}</p>` : ""}
<form method="post" action="/login">
<input name="username" autocomplete="username" placeholder="Username" autofocus required>
<input name="password" type="password" autocomplete="current-password" placeholder="Password" required>
<button type="submit">Log in</button></form></body></html>`;

export interface AppOptions {
  /** Real path of the notes root. */
  root: string;
  token: string;
  version: string;
  /** Static client build; omitted in tests. */
  clientDir?: string;
  /** Wait this long (ms) after a failed login; default 1000. */
  failDelayMs?: number;
  /** Send-to-advisor settings; without them there is no /api/message. */
  message?: MessageConfig;
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
  const logins: LoginStore = createLoginStore(root);
  const failDelay = opts.failDelayMs ?? 1000;
  const backlinks = createBacklinks(root);

  // Tag aliases come from the CLI, read lazily and kept while .meta-notes is unchanged. A failure is not kept.
  let aliases: { mtime: number; value: Promise<TagAliasesResponse> } | null = null;

  // With no login file: the token on every request (cookie, or `Authorization: Bearer`; `GET /?token=`
  // trades it for the cookie). Once a login file exists the token stops working and a session cookie
  // from /login is needed instead.
  app.use("*", async (c, next) => {
    const url = new URL(c.req.url);
    const login = await logins.current();
    if (login) {
      const secure = url.protocol === "https:" || c.req.header("x-forwarded-proto") === "https";
      if (url.pathname === "/login" && c.req.method === "GET") return c.html(loginPage(""));
      if (url.pathname === "/login" && c.req.method === "POST") {
        const form = await c.req.parseBody().catch(() => ({}) as Record<string, unknown>);
        const user = typeof form.username === "string" ? form.username : "";
        const pass = typeof form.password === "string" ? form.password : "";
        if (!(await verifyLogin(login, user, pass))) {
          await new Promise((r) => setTimeout(r, failDelay));
          return c.html(loginPage("Wrong username or password."), 401);
        }
        setCookie(c, SESSION_COOKIE, await logins.start(), {
          httpOnly: true,
          secure,
          sameSite: "Lax",
          path: "/",
          maxAge: SESSION_MS / 1000,
        });
        return c.redirect("/", 303);
      }
      if (url.pathname === "/logout" && c.req.method === "POST") {
        await logins.revoke(getCookie(c, SESSION_COOKIE));
        deleteCookie(c, SESSION_COOKIE, { path: "/" });
        return c.redirect("/login", 303);
      }
      if (!(await logins.valid(getCookie(c, SESSION_COOKIE)))) {
        deleteCookie(c, SESSION_COOKIE, { path: "/" });
        return c.req.method === "GET" && url.pathname === "/" ? c.redirect("/login") : c.text("unauthorized", 401);
      }
      return next();
    }
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

  app.get("/api/version", async (c) => c.json({ version: opts.version, login: (await logins.current()) !== null, message: !!opts.message }));

  app.get("/api/tag-aliases", async (c) => {
    const mtime = await stat(path.join(root, ".meta-notes")).then((st) => st.mtimeMs, () => 0);
    if (aliases?.mtime !== mtime) {
      const value = runMetaNotes(root, ["conventions"]).then((r) => {
        const t = r.ok ? r.tag_aliases : undefined;
        if (!t || typeof t !== "object") {
          aliases = null;
          return {};
        }
        return Object.fromEntries(Object.entries(t).filter(([, v]) => typeof v === "string")) as TagAliasesResponse;
      });
      aliases = { mtime, value };
    }
    return c.json(await aliases.value);
  });

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
  if (opts.message) messageRoutes(app, opts.message);
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
          // The shell must always be revalidated so a reload picks up a new bundle.
          ...(path.extname(file) === ".html" ? { "cache-control": "no-cache" } : {}),
        });
      } catch {
        // try the fallback
      }
    }
    return c.text("not found", 404);
  });

  return app;
}
