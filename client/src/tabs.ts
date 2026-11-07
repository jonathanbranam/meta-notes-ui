/** The pages of the mobile bottom tab bar (design/specs/tabs.md). Now comes first. */
export type TabId = "now" | "home" | "lists";

export const NOW_TAB_PATH = "!now";

export const LISTS_PATH = "!lists";

/** The all-lists page; the bare `!lists` is what the tab opens first and resolves to the current list. */
export const ALL_LISTS_PATH = "!lists/";

export const TABS: { id: TabId; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "home", label: "Home" },
  { id: "lists", label: "Lists" },
];

/** The widest viewport that counts as a phone; the CSS breakpoint is the same number. */
export const MOBILE_MAX_WIDTH = 720;

export function isMobileWidth(width: number): boolean {
  return width <= MOBILE_MAX_WIDTH;
}

/** The tab a page (hash path) belongs to: `!lists` and `!lists/<list>` are Lists, everything else Home. */
export function tabOf(path: string): TabId {
  if (path === NOW_TAB_PATH) return "now";
  return path === LISTS_PATH || path.startsWith(`${LISTS_PATH}/`) ? "lists" : "home";
}

/** Whether the top bar shows: on a phone only on Home (tabs spec); on a wider screen on every page. */
export function topBarShows(mobile: boolean, tab: TabId): boolean {
  return !mobile || tab === "home";
}

/** Where the Message button sits: in the top bar when it shows, else on the page itself. */
export function messageSite(mobile: boolean, tab: TabId): "bar" | "page" {
  return topBarShows(mobile, tab) ? "bar" : "page";
}

/** The list path a Lists page shows, or null for the all-lists page. */
export function listOf(path: string): string | null {
  return path.startsWith(`${LISTS_PATH}/`) ? path.slice(LISTS_PATH.length + 1) || null : null;
}

/** What each tab last showed, so switching tabs keeps its state. */
export type TabMemory = Record<TabId, string>;

/** Records `path` as the last page of its tab. */
export function remember(mem: TabMemory, path: string): TabMemory {
  const tab = tabOf(path);
  return mem[tab] === path ? mem : { ...mem, [tab]: path };
}

/** The page a tap on `tab` opens: where that tab was last. */
export function pageForTab(mem: TabMemory, tab: TabId): string {
  return mem[tab];
}

/** The text sent for a message: the page it was written on, then the human's words. */
export function messageBody(text: string, context: string): string {
  return `[from the UI, page: ${context}]\n\n${text.trim()}`;
}

/** Whether a key press submits the message sheet: Enter, but Shift+Enter (or composing) is a new line. */
export function submitsOnKey(e: { key: string; shiftKey: boolean; isComposing?: boolean }): boolean {
  return e.key === "Enter" && !e.shiftKey && !e.isComposing;
}
