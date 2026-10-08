import { execFile } from "node:child_process";
import path from "node:path";
import type { Hono } from "hono";
import { confine, isHidden, PathError } from "./paths.js";

/** What `meta-notes ... --json` printed (it prints JSON on failure too). */
export type CliResult = { ok: boolean; error?: string; current?: unknown; [k: string]: unknown };

/** Run the meta-notes CLI (argument array, no shell) and parse its JSON. */
export function runMetaNotes(root: string, args: string[]): Promise<CliResult> {
  return new Promise((resolve) => {
    execFile("meta-notes", [...args, "--root", root, "--json"], { maxBuffer: 1 << 24 }, (err, stdout, stderr) => {
      try {
        resolve(JSON.parse(stdout) as CliResult);
      } catch {
        resolve({ ok: false, error: (stderr || err?.message || "meta-notes failed").trim() });
      }
    });
  });
}

const isStr = (v: unknown): v is string => typeof v === "string";
const isLine = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;

/** A Time Block row's time as the CLI takes it: `HH:MM` or `9:30am`. */
const isTime = (v: unknown): v is string => isStr(v) && /^\d{1,2}:\d{2}\s*([ap]m)?$/i.test(v.trim());

/** A Time Log time: `HH:MM` or `9:30am`, `~` first for approximately. */
const isClock = (s: string) => /^~?\s*\d{1,2}:\d{2}\s*([ap]m)?$/i.test(s.trim());

/** A root-relative `.md` path that is inside the root and not hidden; for notes that may not exist yet. */
async function notePath(root: string, rel: unknown, mustExist: boolean): Promise<string | null> {
  if (!isStr(rel) || !rel.endsWith(".md")) return null;
  try {
    if (mustExist) await confine(root, rel);
    else {
      const back = path.relative(root, path.resolve(root, rel));
      if (rel.includes("\0") || path.isAbsolute(rel) || back.startsWith("..") || isHidden(back)) return null;
      // The directory it goes in must not lead out of the root through a symlink.
      let dir = path.dirname(back);
      while (dir !== ".") {
        try {
          await confine(root, dir);
          break;
        } catch (e) {
          if (!(e instanceof PathError) || e.message !== "not found") return null;
          dir = path.dirname(dir);
        }
      }
    }
  } catch {
    return null;
  }
  return rel;
}

/** Edit routes. Every write is a meta-notes command carrying `--expect` (rule writes-through-the-cli). */
export function editRoutes(app: Hono, root: string): void {
  const reply = (c: { json: (b: unknown, s: 200 | 400 | 409) => Response }, r: CliResult) =>
    r.ok ? c.json(r, 200) : c.json(r, r.current !== undefined ? 409 : 400);

  // Set a task line's status. body: {path, line, expect, status}
  app.post("/api/task", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    if (!rel || !isLine(b.line) || !isStr(b.expect) || !isStr(b.status) || b.status.length !== 1) return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["task", "update", `${rel}:${b.line}`, `--expect=${b.expect}`, `--status=${b.status}`]));
  });

  // Add a task at the end of a note. body: {path, text, due?}. The CLI takes --expect only with --under, which the UI does not use.
  app.post("/api/task/add", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    const text = isStr(b.text) ? b.text.trim() : "";
    const due = b.due === undefined || b.due === "" ? null : b.due;
    if (!rel || !text || text.includes("\n") || (due !== null && !(isStr(due) && /^\d{4}-\d{2}-\d{2}$/.test(due)))) return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["task", "add", rel, text, ...(due ? [`--due=${due}`] : [])]));
  });

  // Replace lines from..to with text. body: {path, from, to, expect, text}
  app.post("/api/write", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    if (!rel || !isLine(b.from) || !isLine(b.to) || b.to < b.from || !isStr(b.expect) || !isStr(b.text)) return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["note", "write", rel, `--lines=${b.from}..${b.to}`, `--expect=${b.expect}`, `--text=${b.text}`]));
  });

  // Set one Time Block cell. body: {path, time, column: "plan"|"actual", expect, text}; expect is the cell as shown ("" for empty).
  app.post("/api/timeblock", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    if (!rel || !isTime(b.time) || (b.column !== "plan" && b.column !== "actual") || !isStr(b.expect) || !isStr(b.text) || b.text.includes("\n") || b.text.includes("|"))
      return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["time-block", "update", rel, `--time=${b.time.trim()}`, `--${b.column}=${b.text}`, `--expect=${b.expect}`]));
  });

  // Replace the rows from..through. body: {path, time, through, expect, text}; expect and text are `| time | plan | actual |` lines.
  app.post("/api/timeblock/replace", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    if (!rel || !isTime(b.time) || !isTime(b.through) || !isStr(b.expect) || !isStr(b.text) || !b.text.trim()) return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["time-block", "replace", rel, `--time=${b.time.trim()}`, `--through=${b.through.trim()}`, `--expect=${b.expect}`, `--text=${b.text}`]));
  });

  // Append a Time Log entry. body: {path, text, start?, prev?, prevStart?, prevOpen?, closePrev?, first?}; text is the header line `- what`.
  app.post("/api/timelog/append", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    const opt = (v: unknown, ok: (s: string) => boolean) => v === undefined || v === "" || (isStr(v) && ok(v));
    const oneLine = (s: string) => !s.includes("\n");
    if (
      !rel || !isStr(b.text) || !/^- \S/.test(b.text) || !oneLine(b.text) ||
      !opt(b.start, isClock) || !opt(b.prevStart, isClock) || !opt(b.prev, (s) => /^- /.test(s) && oneLine(s)) ||
      (b.closePrev && !b.prevOpen) || (b.first && (b.prev || b.prevStart || b.prevOpen))
    )
      return c.json({ ok: false, error: "bad request" }, 400);
    const args = ["time-log", "append", rel, `--text=${b.text}`];
    if (b.start) args.push(`--start=${b.start.trim()}`);
    if (b.first) args.push("--first");
    if (b.prev) args.push(`--prev=${b.prev}`);
    if (b.prevStart) args.push(`--prev-start=${b.prevStart.trim()}`);
    if (b.prevOpen) args.push("--prev-open");
    if (b.closePrev) args.push("--close-prev");
    return reply(c, await runMetaNotes(root, args));
  });

  // Replace whole Time Log entries. body: {path, expect, text}; expect is the entries as shown, text empty deletes them.
  app.post("/api/timelog/update", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, true);
    if (!rel || !isStr(b.expect) || !b.expect.trim() || !isStr(b.text)) return c.json({ ok: false, error: "bad request" }, 400);
    return reply(c, await runMetaNotes(root, ["time-log", "update", rel, `--expect=${b.expect}`, `--text=${b.text}`]));
  });

  // New note from the template meta-notes picks. body: {path}
  app.post("/api/new", async (c) => {
    const b = await c.req.json().catch(() => ({}));
    const rel = await notePath(root, b.path, false);
    if (!rel) return c.json({ ok: false, error: "bad request" }, 400);
    const r = await runMetaNotes(root, ["note", "new", rel]);
    if (r.ok && r.created === false) return c.json({ ok: false, error: `${rel} already exists` }, 409);
    return reply(c, r);
  });
}
