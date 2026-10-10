/** The localStorage keys holding the file tree's collapsed state and width (design/specs/treepane.md). */
export const TREE_COLLAPSED_KEY = "meta-notes-ui.tree-collapsed";
export const TREE_WIDTH_KEY = "meta-notes-ui.tree-width";

export const TREE_MIN = 160;
export const TREE_MAX = 600;
export const TREE_DEFAULT = 280;

/** A width kept between the min and the max; anything that isn't a number gives the default. */
export function clampTreeWidth(w: number): number {
  if (!Number.isFinite(w)) return TREE_DEFAULT;
  return Math.min(TREE_MAX, Math.max(TREE_MIN, Math.round(w)));
}

export interface TreePaneState {
  collapsed: boolean;
  width: number;
}

/** The stored state; defaults (open, 280 px) when nothing is stored or storage is unavailable. */
export function readTreePane(): TreePaneState {
  try {
    const w = localStorage.getItem(TREE_WIDTH_KEY);
    return {
      collapsed: localStorage.getItem(TREE_COLLAPSED_KEY) === "1",
      width: w === null ? TREE_DEFAULT : clampTreeWidth(Number(w)),
    };
  } catch {
    return { collapsed: false, width: TREE_DEFAULT };
  }
}

/** Keeps the state in localStorage; a full or blocked storage just means it isn't remembered. */
export function writeTreePane(s: TreePaneState): void {
  try {
    localStorage.setItem(TREE_COLLAPSED_KEY, s.collapsed ? "1" : "0");
    localStorage.setItem(TREE_WIDTH_KEY, String(clampTreeWidth(s.width)));
  } catch {
    // Storage is full or blocked: the tree still works, it just won't be remembered.
  }
}
