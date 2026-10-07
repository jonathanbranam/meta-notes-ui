import { headingSlug, parseWikiLink, resolveLink, WIKI_LINK } from "../../shared/links";

// A small subset of mdast, enough for the plugins below.
export interface Node {
  type: string;
  value?: string;
  checked?: boolean | null;
  children?: Node[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
  [k: string]: unknown;
}

export interface RenderContext {
  /** Path of the open note, for relative links. */
  path: string;
  /** Every note path in the root. */
  files: ReadonlySet<string>;
  /** Today as YYYY-MM-DD, local. */
  today: string;
  /** Minutes since midnight, local. */
  nowMinutes: number;
  /** Alias tag to canonical tag, from meta-notes; absent means no folding. */
  tagAliases?: Readonly<Record<string, string>>;
}

const span = (cls: string, text: string, extra: Record<string, unknown> = {}): Node => ({
  type: "span",
  data: { hName: "span", hProperties: { className: cls, ...extra } },
  children: [{ type: "text", value: text }],
});

/** Split text nodes by a regex; matches become nodes made by `make`. Other node types pass through. */
function mapText(nodes: Node[], re: RegExp, make: (m: RegExpExecArray) => Node | string): Node[] {
  return nodes.flatMap((n) => {
    if (n.type !== "text" || n.value === undefined) return [n];
    const out: Node[] = [];
    let last = 0;
    for (const m of n.value.matchAll(new RegExp(re.source, "gu"))) {
      const made = make(m as RegExpExecArray);
      const start = m.index;
      if (start > last) out.push({ type: "text", value: n.value.slice(last, start) });
      out.push(typeof made === "string" ? { type: "text", value: made } : made);
      last = m.index + m[0].length;
    }
    if (last < n.value.length) out.push({ type: "text", value: n.value.slice(last) });
    return out;
  });
}

export function wikiLinks(nodes: Node[], ctx: RenderContext): Node[] {
  return mapText(nodes, WIKI_LINK, (m) => {
    const { target, alias, heading } = parseWikiLink(m[1]);
    const label = alias ?? target;
    const found = resolveLink(target, ctx.path, ctx.files);
    const text: Node[] = [{ type: "text", value: label }];
    return found
      ? { type: "link", url: `#${encodeURIComponent(found).replace(/%2F/g, "/")}${heading ? `#${encodeURIComponent(headingSlug(heading))}` : ""}`, title: null, children: text, data: { hProperties: { className: "wikilink" } } }
      : { type: "wikimissing", children: text, data: { hName: "span", hProperties: { className: "wikilink missing", title: "No such note" } } };
  });
}

/** `#tag`: letters, digits, `_`, `-`, not glued to a word or a path. */
const TAG = /(?<![\w/&#])#([A-Za-z0-9_-]+)/;
export function tags(nodes: Node[], aliases: Readonly<Record<string, string>> = {}): Node[] {
  return mapText(nodes, TAG, (m) => {
    const tag = m[1].toLowerCase();
    return span("tag", m[0], { "data-tag": Object.hasOwn(aliases, tag) ? aliases[tag] : tag });
  });
}

export interface TaskInfo {
  status: string;
  due?: string;
  overdue: boolean;
  /** A task has a due or start date; without one it is a checklist item. */
  dated: boolean;
}

const CHIP = /(📅|⏳|🛫|✅)\s*(\d{4}-\d{2}-\d{2})?(?:[ ](\d{1,2}:\d{2}))?|⏰\s*(\d{1,2}:\d{2})|🔁\s*([^📅⏳🛫✅⏰#\n]*?)(?=\s*(?:[📅⏳🛫✅⏰#]|$))/u;
const CHIP_CLASS: Record<string, string> = { "📅": "due", "⏳": "scheduled", "🛫": "start", "✅": "done" };

export function taskChips(nodes: Node[], status: string, today: string): { nodes: Node[]; info: TaskInfo } {
  const info: TaskInfo = { status, overdue: false, dated: false };
  const out = mapText(nodes, CHIP, (m) => {
    if (m[1]) {
      const date = m[2];
      const time = m[3];
      const kind = CHIP_CLASS[m[1]];
      let cls = `chip ${kind}`;
      if (kind === "due" || kind === "start") info.dated = true;
      if (kind === "due" && date) {
        info.due = date;
        if (date < today && isOpen(status)) {
          cls += " overdue";
          info.overdue = true;
        }
      }
      return span(cls, [m[1], date, time].filter(Boolean).join(" "));
    }
    if (m[4]) return span("chip time", `⏰ ${m[4]}`);
    return span("chip recur", `🔁 ${m[5].trim()}`);
  });
  return { nodes: out, info };
}

export const isOpen = (status: string) => !"xX->".includes(status);

/** Minutes since midnight for `8:15am`, `12:00pm`; null if not a time. */
export function parseClock(s: string): number | null {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*$/i.exec(s);
  if (!m) return null;
  return (Number(m[1]) % 12) * 60 + Number(m[2]) + (m[3].toLowerCase() === "pm" ? 720 : 0);
}

const plain = (n: Node): string => (n.value ?? "") + (n.children ?? []).map(plain).join("");

/** The daily note's date, from `2026-10-04 Sun.md`. */
export function noteDate(path: string): string | null {
  return /(\d{4}-\d{2}-\d{2})[^/]*\.md$/.exec(path)?.[1] ?? null;
}

/**
 * Time Block table: class on the table; rows with `no plan` dimmed; on
 * today's note, the row holding the current time highlighted.
 */
function timeBlock(table: Node, ctx: RenderContext): void {
  const rows = (table.children ?? []).slice(1);
  const times = rows.map((r) => parseClock(plain(r.children?.[0] ?? { type: "text" })));
  const isToday = noteDate(ctx.path) === ctx.today;
  let current = -1;
  if (isToday)
    times.forEach((t, i) => {
      if (t !== null && t <= ctx.nowMinutes) current = i;
    });
  // Past the last row's quarter hour, nothing is current.
  if (current === times.length - 1 && ctx.nowMinutes >= (times[current] ?? 0) + 15) current = -1;
  rows.forEach((r, i) => {
    const cls: string[] = [];
    if (/^no plan$/i.test(plain(r.children?.[1] ?? { type: "text" }).trim())) cls.push("noplan");
    if (i === current) cls.push("now");
    if (cls.length) r.data = { hProperties: { className: cls.join(" ") } };
  });
  table.data = { hProperties: { className: "timeblock" } };
}

function walk(node: Node, ctx: RenderContext): void {
  if (node.type === "root") timeLog(node);
  if (node.type === "table") {
    const head = (node.children?.[0]?.children ?? []).map((c) => plain(c).trim().toLowerCase());
    if (head[0] === "time" && head[1] === "plan") timeBlock(node, ctx);
  }
  if (node.type === "listItem") taskItem(node, ctx);
  if (!node.children || node.type === "link" || node.type === "inlineCode" || node.type === "code") return;
  // Inline content: links, then tags, among the text children.
  if (node.type === "paragraph" || node.type === "heading" || node.type === "tableCell" || node.type === "emphasis" || node.type === "strong" || node.type === "delete") {
    node.children = tags(wikiLinks(node.children, ctx), ctx.tagAliases);
  }
  node.children.forEach((c) => walk(c, ctx));
}

/** A checkbox list item: status from gfm (`[ ]`, `[x]`) or from `[c]` left in the text. */
function taskItem(item: Node, ctx: RenderContext): void {
  const para = item.children?.[0];
  if (para?.type !== "paragraph" || !para.children?.length) return;
  let status: string | null = item.checked === true ? "x" : item.checked === false ? " " : null;
  const first = para.children[0];
  if (status === null && first.type === "text") {
    const m = /^\[(.)\]\s+/.exec(first.value ?? "");
    if (m) {
      status = m[1];
      first.value = (first.value ?? "").slice(m[0].length);
    }
  }
  if (status === null) return;
  const { nodes, info } = taskChips(para.children, status, ctx.today);
  para.children = nodes;
  item.data = {
    hProperties: {
      className: ["task-item", ...(info.dated ? [] : ["checklist"]), `status-${statusName(status)}`, ...(info.overdue ? ["overdue"] : [])].join(" "),
      "data-status": status,
    },
  };
}

export function statusName(s: string): string {
  if ("xX".includes(s)) return "done";
  if (s === ">") return "moved";
  if (s === "-") return "canceled";
  if (".oO".includes(s)) return "partial";
  return "open";
}

/** Remark plugin factory; `ctx` is read when the note is rendered. */
export function metaNotes(ctx: RenderContext) {
  return () => (tree: Node) => walk(tree, ctx);
}

/** `9:45`, `~11:00` (the tilde means approximately) as minutes since midnight. */
function logClock(s: string): number | null {
  const m = /^~?\s*(\d{1,2}):(\d{2})$/.exec(s.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

const hhmm = (s: string) => s.trim().replace(/^~\s*/, "").replace(/^(\d):/, "0$1:");

/**
 * Entries under a `### Log` heading: each `* start:` / `* end:` line becomes
 * a "start – end · duration" span after the entry's header line; other
 * nested lines stay as notes.
 */
function timeLog(root: Node): void {
  const kids = root.children ?? [];
  const at = kids.findIndex((n) => n.type === "heading" && n.depth === 3 && plain(n).trim().toLowerCase() === "log");
  if (at < 0) return;
  for (const list of kids.slice(at + 1)) {
    if (list.type === "heading") break;
    if (list.type !== "list") continue;
    for (const item of list.children ?? []) {
      const [head, ...rest] = item.children ?? [];
      const sub = rest.find((n) => n.type === "list");
      if (head?.type !== "paragraph" || !sub) continue;
      let start: string | undefined;
      let end = "";
      sub.children = (sub.children ?? []).filter((li) => {
        const m = /^(start|end):[ \t]*(.*)$/.exec(plain(li).trim());
        if (!m) return true;
        if (m[1] === "start") start = m[2];
        else end = m[2];
        return false;
      });
      if (start === undefined) continue;
      const a = logClock(start);
      const b = logClock(end);
      let text = `${hhmm(start)} – ${end.trim() ? hhmm(end) : "open"}`;
      if (a !== null && b !== null && b >= a) {
        const d = b - a;
        text += ` · ${d >= 60 ? `${Math.floor(d / 60)}h ` : ""}${d % 60}m`.replace(/ 0m$/, "");
      }
      head.children = [...(head.children ?? []), { type: "text", value: " " }, span("logtime", text)];
      if (!sub.children.length) item.children = (item.children ?? []).filter((n) => n !== sub);
    }
  }
}

/** A frontmatter value: text, a list, or a map keeping its order. */
export type PropValue = string | PropValue[] | { [key: string]: PropValue };

const unquote = (s: string) => s.trim().replace(/^(["'])(.*)\1$/, "$2");

/** `a, b` inside `[...]`; a value that starts `[[` is a wiki link, not a list. */
function scalar(raw: string): PropValue {
  const t = raw.trim();
  if (/^\[(?!\[)(.*)\]$/.test(t)) {
    const inner = t.slice(1, -1).trim();
    return inner ? inner.split(",").map((x) => unquote(x)) : [];
  }
  return unquote(t);
}

/** Frontmatter as a map; handles `k: v`, `k: [a, b]`, `- item` lists and maps nested by indentation. */
export function parseFrontmatter(text: string): [string, PropValue][] {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return [];
  const lines = m[1].split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
  let i = 0;
  const indentOf = (l: string) => l.length - l.trimStart().length;

  function block(indent: number): PropValue {
    if (lines[i].trim().startsWith("- ")) {
      const list: PropValue[] = [];
      while (i < lines.length && indentOf(lines[i]) === indent && lines[i].trim().startsWith("- ")) {
        const body = lines[i].trim().slice(2);
        if (/^[\w-][\w .-]*:(\s|$)/.test(body)) {
          // A map starting on the dash line: its other keys are indented past the dash.
          lines[i] = `${" ".repeat(indent + 2)}${body}`;
          list.push(block(indent + 2));
        } else {
          i++;
          list.push(scalar(body));
        }
      }
      return list;
    }
    const map: { [key: string]: PropValue } = {};
    while (i < lines.length && indentOf(lines[i]) === indent) {
      const kv = /^([\w-][\w .-]*):\s*(.*)$/.exec(lines[i].trim());
      if (!kv) {
        i++;
        continue;
      }
      i++;
      if (kv[2]) map[kv[1]] = scalar(kv[2]);
      else if (i < lines.length && (indentOf(lines[i]) > indent || (indentOf(lines[i]) === indent && lines[i].trim().startsWith("- ")))) map[kv[1]] = block(indentOf(lines[i]));
      else map[kv[1]] = "";
    }
    return map;
  }

  if (!lines.length) return [];
  const top = block(indentOf(lines[0]));
  return typeof top === "object" && !Array.isArray(top) ? Object.entries(top) : [];
}

/** A value as flat text: lists `a, b`, maps `{k: v, k2: v2}`. */
export function propText(v: PropValue): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(propText).join(", ");
  return `{${Object.entries(v).map(([k, x]) => `${k}: ${propText(x)}`).join(", ")}}`;
}

export interface Segment {
  text: string;
  /** Hash for a link to an existing note; undefined for plain text. */
  href?: string;
  missing?: boolean;
}

/** Split value text into plain text and `[[wiki links]]`, resolved like those in the note. */
export function valueSegments(text: string, ctx: RenderContext): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(new RegExp(WIKI_LINK.source, "gu"))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const { target, alias, heading } = parseWikiLink(m[1]);
    const found = resolveLink(target, ctx.path, ctx.files);
    const label = alias ?? target;
    out.push(found ? { text: label, href: `#${encodeURIComponent(found).replace(/%2F/g, "/")}${heading ? `#${encodeURIComponent(headingSlug(heading))}` : ""}` } : { text: label, missing: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
