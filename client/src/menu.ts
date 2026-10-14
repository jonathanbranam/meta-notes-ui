// Pure rules for the top-bar menu: which alerts item it shows, and what closes it.

export type PushState = "off" | "available" | "on";
export type AlertsAction = "ask" | "enable" | "disable";
export interface AlertsItem {
  label: string;
  /** Null: a note only, nothing to do (alerts blocked in this browser). */
  action: AlertsAction | null;
}

/** The menu's alerts item; null when the server has push off or the browser cannot show notifications. */
export function alertsItem(push: PushState, perm: string): AlertsItem | null {
  if (push === "off" || perm === "unsupported") return null;
  if (push === "on") return { label: "Alerts off", action: "disable" };
  if (perm === "default") return { label: "Enable alerts", action: "ask" };
  if (perm === "granted") return { label: "Enable alerts", action: "enable" };
  return { label: "Alerts are blocked in this browser", action: null };
}

export type MenuEvent = { type: "keydown"; key: string } | { type: "pointerdown"; inside: boolean };

/** Escape and a press outside the menu close it; a press inside does not (the item's own click does). */
export const closesMenu = (e: MenuEvent): boolean => (e.type === "keydown" ? e.key === "Escape" : !e.inside);

/**
 * The button linking Today and today's daily note: on Today, to the daily note (when it exists);
 * on that note, back to Today. `daily` is today's daily note path, or null when there is none.
 */
export function dayLink(onToday: boolean, path: string, daily: string | null): { label: string; to: "today" | string } | null {
  if (onToday) return daily ? { label: "Daily note", to: daily } : null;
  return daily && path === daily ? { label: "Today", to: "today" } : null;
}
