import { watch, type FSWatcher } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { ChangeEvent } from "../shared/types.js";
import { HIDDEN, isHidden } from "./paths.js";

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
 * Watches the root (recursively; on Linux one watch per non-hidden directory). Bursts are debounced; each path is then
 * classified once: gone -> removed, new name seen -> added, else changed.
 */
export function watchRoot(
  root: string,
  onEvents: (events: ChangeEvent[]) => void,
  debounceMs = 200,
): { close(): void; watched(): string[] } {
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
  const note = (kind: string, rel: string) => {
    if (isHidden(rel)) return;
    if (kind === "rename") renamed.add(rel);
    debouncer.add(rel);
  };

  if (process.platform !== "linux") {
    const w: FSWatcher = watch(root, { recursive: true }, (kind, name) => {
      if (name) note(kind, name.toString().split(path.sep).join("/"));
    });
    w.on("error", () => {});
    return {
      watched: () => [""],
      close() {
        debouncer.stop();
        w.close();
      },
    };
  }

  // Linux: recursive fs.watch would also watch .git, .venv and the like, so
  // watch each non-hidden directory on its own.
  const dirs = new Map<string, FSWatcher>();
  let closed = false;
  const unwatch = (rel: string) => {
    for (const [d, w] of dirs) {
      if (d === rel || d.startsWith(rel + "/")) {
        w.close();
        dirs.delete(d);
      }
    }
  };
  const watchTree = async (rel: string): Promise<void> => {
    if (closed || dirs.has(rel)) return;
    let w: FSWatcher;
    try {
      w = watch(path.join(root, rel), (kind, name) => {
        if (!name) return;
        const child = rel ? `${rel}/${name.toString()}` : name.toString();
        if (isHidden(child)) return;
        note(kind, child);
        if (kind === "rename") {
          stat(path.join(root, child)).then(
            (st) => (st.isDirectory() ? watchTree(child) : undefined),
            () => unwatch(child),
          );
        }
      });
    } catch {
      return;
    }
    w.on("error", () => {});
    dirs.set(rel, w);
    let entries;
    try {
      entries = await readdir(path.join(root, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory() && !HIDDEN.has(e.name)) await watchTree(rel ? `${rel}/${e.name}` : e.name);
    }
  };
  void watchTree("");
  return {
    watched: () => [...dirs.keys()],
    close() {
      closed = true;
      debouncer.stop();
      for (const w of dirs.values()) w.close();
      dirs.clear();
    },
  };
}
