/** Lists page logic (design/specs/lists.md): what `meta-notes list show --json` gives, shaped for the page. */
export interface ListSource {
  file: string;
  line: number;
  text: string;
}
export interface ListItem {
  number: number;
  text: string;
  state: "open" | "done" | "canceled";
  source: ListSource | null;
}
export interface ListGroup {
  name: string | null;
  items: ListItem[];
}
export interface ListFile {
  list: string;
  name: string;
  groups: ListGroup[];
}

/** The groups with only their open items (empty groups dropped), in file order. */
export function openGroups(l: ListFile): ListGroup[] {
  return l.groups.map((g) => ({ name: g.name, items: g.items.filter((i) => i.state === "open") })).filter((g) => g.items.length > 0);
}

const stateOf = (l: ListFile, state: ListItem["state"]) => l.groups.flatMap((g) => g.items.filter((i) => i.state === state));

/** The Got section: every checked item, in file order. */
export const gotItems = (l: ListFile) => stateOf(l, "done");

/** Canceled items, shown apart. */
export const canceledItems = (l: ListFile) => stateOf(l, "canceled");

/** The list to open on entering the Lists tab: today's current list, else the last one shown, if it still exists. */
export function chooseList(current: string | null, last: string | null, all: string[]): string | null {
  if (current && all.includes(current)) return current;
  return last && all.includes(last) ? last : null;
}

/** The task text with its checkbox, status and trailing done date taken off, for finding it again. */
function body(line: string): string {
  return line.replace(/^\s*[-*+]\s*\[.\]\s*/, "").replace(/\s*✅.*$/u, "").trim();
}

/** The line to show for a source: its line when still the same task, else the first line with the same text, else its line. */
export function locateLine(noteText: string, src: ListSource): number {
  const lines = noteText.split("\n");
  const want = body(src.text);
  if (want && body(lines[src.line - 1] ?? "") === want) return src.line;
  const at = want ? lines.findIndex((l) => body(l) === want) : -1;
  return at === -1 ? src.line : at + 1;
}

/** The note a source points at: the CLI names it without `.md`. */
export const sourcePath = (src: ListSource) => (src.file.endsWith(".md") ? src.file : `${src.file}.md`);

export const LAST_LIST_KEY = "meta-notes-ui.last-list";

export function readLastList(): string | null {
  try {
    return localStorage.getItem(LAST_LIST_KEY);
  } catch {
    return null;
  }
}

export function writeLastList(path: string): void {
  try {
    localStorage.setItem(LAST_LIST_KEY, path);
  } catch {
    // Storage is blocked: the tab just opens the current list next time.
  }
}
