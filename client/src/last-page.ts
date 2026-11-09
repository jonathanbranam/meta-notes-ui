/** The localStorage key holding the page the user last had open (design/specs/lastpage.md). */
export const LAST_PAGE_KEY = "meta-notes-ui.last-page";

/** The hash (without `#`) a fresh start opens: the URL's page when it names one, else the stored page, else Today. */
export function startHash(hash: string, stored: string | null, todayPath: string): string {
  return hash || stored || todayPath;
}

/** The stored page, or null when nothing is stored or storage is unavailable. */
export function readLastPage(): string | null {
  try {
    return localStorage.getItem(LAST_PAGE_KEY);
  } catch {
    return null;
  }
}

/** Keeps the page in localStorage; a full or blocked storage just means no reopen. */
export function writeLastPage(path: string): void {
  try {
    localStorage.setItem(LAST_PAGE_KEY, path);
  } catch {
    // Storage is full or blocked: the app still works, it just won't reopen this page.
  }
}
