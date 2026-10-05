import { watch, type FSWatcher } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { ChangeEvent } from "../shared/types.js";
import { isHidden } from "./paths.js";

/** Collects keys and flushes them once, `ms` after the last one arrived. */
export class Debouncer<T> {
  private pending = new Set<T>();
  private timer: NodeJS.Timeout | undefined;
  constructor(
    private ms: number,
    private flush: (items: T[]) => void,
  ) {}
  add(item: T): void {
    this.pending.add(item);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const items = [...this.pending];
      this.pending.clear();
      this.timer = undefined;
      this.flush(items);
    }, this.ms);
  }
  stop(): void {
    clearTimeout(this.timer);
    this.pending.clear();
  }
}

/**
 * One recursive watch of the root. Bursts are debounced; each path is then
 * classified once: gone -> removed, new name seen -> added, else changed.
 */
export function watchRoot(
  root: string,
  onEvents: (events: ChangeEvent[]) => void,
  debounceMs = 200,
): { close(): void } {
  const renamed = new Set<string>();
  const debouncer = new Debouncer<string>(debounceMs, async (paths) => {
    const events: ChangeEvent[] = [];
    for (const p of paths) {
      const isRename = renamed.delete(p);
      try {
        await stat(path.join(root, p));
        events.push({ type: isRename ? "added" : "changed", path: p });
      } catch {
        events.push({ type: "removed", path: p });
      }
    }
    if (events.length) onEvents(events);
  });
  const w: FSWatcher = watch(root, { recursive: true }, (kind, name) => {
    if (!name) return;
    const rel = name.toString().split(path.sep).join("/");
    if (isHidden(rel)) return;
    if (kind === "rename") renamed.add(rel);
    debouncer.add(rel);
  });
  w.on("error", () => {});
  return {
    close() {
      debouncer.stop();
      w.close();
    },
  };
}
