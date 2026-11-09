// The colour theme setting: System (follow the OS), Light or Dark. Kept per browser in localStorage.
// The root element carries data-theme="light" or "dark" (the resolved theme); style.css keys its dark
// styles on data-theme="dark". index.html runs the same resolution before first paint (no flash).

export type Theme = "system" | "light" | "dark";
export const THEME_KEY = "mn-theme";
const ORDER: Theme[] = ["system", "light", "dark"];

export const parseTheme = (v: string | null): Theme => (v === "light" || v === "dark" ? v : "system");
export const nextTheme = (t: Theme): Theme => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length];
export const themeLabel = (t: Theme): string => `Theme: ${t[0].toUpperCase()}${t.slice(1)}`;
/** The theme the page shows: an explicit choice wins; System follows the OS. */
export const resolveTheme = (t: Theme, systemDark: boolean): "light" | "dark" => (t === "system" ? (systemDark ? "dark" : "light") : t);

export function storedTheme(): Theme {
  try {
    return parseTheme(localStorage.getItem(THEME_KEY));
  } catch {
    return "system";
  }
}

export function applyTheme(t: Theme): void {
  document.documentElement.dataset.theme = resolveTheme(t, matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Saves and applies the choice; with System, also follows later OS changes (call once at start). */
export function setTheme(t: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    // storage blocked: the choice still applies until reload
  }
  applyTheme(t);
}

export function watchSystemTheme(): void {
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme(storedTheme()));
}
