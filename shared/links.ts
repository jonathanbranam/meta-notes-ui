export interface WikiLink {
  /** The path part, without alias or `#anchor`. */
  target: string;
  alias?: string;
}

export const WIKI_LINK = /\[\[([^\]\n]+)\]\]/g;

/** `path|alias#anchor` → its parts. */
export function parseWikiLink(inner: string): WikiLink {
  const bar = inner.indexOf("|");
  const raw = bar === -1 ? inner : inner.slice(0, bar);
  const alias = bar === -1 ? undefined : inner.slice(bar + 1).trim() || undefined;
  return { target: raw.split("#")[0].trim(), alias };
}

/** Join and normalise; null when the result leaves the notes root. */
function normalise(parts: string[]): string | null {
  const out: string[] = [];
  for (const seg of parts.join("/").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      if (!out.pop()) return null;
    } else out.push(seg);
  }
  return out.join("/");
}

/**
 * The note a link points at, like the plugin: a path from the notes root
 * (`.md` added), else relative to the linking note's folder; `x` also
 * matches the folder note `x/Home.md`. Null when no such note exists.
 */
export function resolveLink(target: string, from: string, files: ReadonlySet<string>): string | null {
  const t = target.replace(/\.md$/, "");
  if (!t) return null;
  const dir = from.includes("/") ? from.slice(0, from.lastIndexOf("/")) : "";
  const bases = /^\.\.?\//.test(t) ? [normalise([dir, t])] : [normalise([t]), normalise([dir, t])];
  for (const b of bases) {
    if (!b) continue;
    for (const c of [`${b}.md`, `${b}/Home.md`]) if (files.has(c)) return c;
  }
  return null;
}

/** Raw wiki link targets in a note's text. */
export function extractLinks(text: string): string[] {
  return [...text.matchAll(WIKI_LINK)].map((m) => parseWikiLink(m[1]).target).filter(Boolean);
}
