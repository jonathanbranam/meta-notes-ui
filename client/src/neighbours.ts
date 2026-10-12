/** Previous and next note navigation (design/specs/neighbours.md). Pure; never creates a note. */

const DAILY = /^plan\/daily\/(?:.+\/)?\d{4}-\d{2}-\d{2} [A-Za-z]{3}\.md$/;

export interface Neighbours {
  prev: string | null;
  next: string | null;
}

export const isDaily = (path: string) => DAILY.test(path);

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The notes before and after `current` in sorted path order. For a daily note the list is
 * every daily note (quarter and year folders sort chronologically, as in the vim command);
 * otherwise the .md files of the same folder. `current` need not exist (Today before its note is made).
 */
export function neighbours(current: string, files: Iterable<string>): Neighbours {
  const dir = current.slice(0, current.lastIndexOf("/") + 1);
  const keep = isDaily(current)
    ? isDaily
    : (p: string) => p.endsWith(".md") && p.startsWith(dir) && !p.slice(dir.length).includes("/");
  let prev: string | null = null;
  let next: string | null = null;
  for (const p of files) {
    if (!keep(p)) continue;
    const c = cmp(p, current);
    if (c < 0 && (prev === null || p > prev)) prev = p;
    if (c > 0 && (next === null || p < next)) next = p;
  }
  return { prev, next };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Where the daily note for a (local) day lives, whether or not it exists. */
export function dailyPath(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const q = `${p(d.getFullYear() % 100)}-Q${Math.floor(d.getMonth() / 3) + 1}`;
  return `plan/daily/${q}/${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${DAYS[d.getDay()]}.md`;
}
