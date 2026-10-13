import { readFile } from "node:fs/promises";
import type { ChangeEvent, TodayTask } from "../shared/types.js";
import { buildAlerts, parseTimeBlock, type Alert } from "../shared/today.js";
import { runMetaNotes } from "./edits.js";
import { confine } from "./paths.js";
import type { PushStore } from "./push.js";

/** An alert later than this when the server finds it unsent is skipped, not sent (design/web-push.md, "Missed sends"). */
export const LATE_MS = 10 * 60_000;
const DEBOUNCE_MS = 2000;
/** Node caps a timer near 24.8 days; the longest wait here is until midnight, so this never bites. */
const MAX_TIMER_MS = 2 ** 31 - 1;

export interface Inputs {
  tasks: TodayTask[];
  /** The text of today's daily note, "" when there is none. */
  daily: string;
}

/** Today's inputs the way `GET /api/today` gets them: the CLI names the tasks and the daily note. */
export function cliInputs(root: string): () => Promise<Inputs> {
  return async () => {
    const [daily, tasks] = await Promise.all([runMetaNotes(root, ["note", "daily", "--render"]), runMetaNotes(root, ["tasks", "--overdue", "--due"])]);
    if (!tasks.ok) throw new Error(tasks.error ?? "meta-notes failed");
    let text = "";
    if (daily.ok && typeof daily.path === "string" && daily.exists === true) {
      try {
        text = await readFile(await confine(root, daily.path), "utf8");
      } catch {
        // no readable daily note: only the tasks alert
      }
    }
    return { tasks: (tasks.tasks as TodayTask[] | undefined) ?? [], daily: text };
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export interface Scheduler {
  /** Plan from the notes now: send late-but-recent alerts, skip older ones, arm the timer. */
  replan: () => Promise<void>;
  /** Watcher batch: a changed `.md` file re-plans after a short debounce. */
  onChanges: (events: ChangeEvent[]) => void;
  /** The alerts planned for today and not yet sent. */
  pending: () => Alert[];
  stop: () => void;
}

/**
 * One timer for the earliest unsent alert, one for midnight, and a re-plan when notes change.
 * Nothing polls. With no subscribed device it plans nothing.
 */
export function createScheduler(push: PushStore, load: () => Promise<Inputs>): Scheduler {
  let plan: Alert[] = [];
  let alertTimer: ReturnType<typeof setTimeout> | undefined;
  let midnightTimer: ReturnType<typeof setTimeout> | undefined;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | null = null;
  let again = false;
  let stopped = false;

  const unsent = () => plan.filter((a) => !push.wasSent(a.id, a.at));

  async function sendDue(): Promise<void> {
    const now = Date.now();
    for (const a of unsent().filter((x) => x.at <= now)) {
      // Mark first: a re-plan during the send must not send it twice.
      await push.markSent(a.id, a.at);
      if (now - a.at <= LATE_MS) await push.sendPush({ title: a.title, tag: a.id, url: "/#!today" });
    }
  }

  function arm(): void {
    clearTimeout(alertTimer);
    alertTimer = undefined;
    // Any unsent alert is next, even one that came due while sending: sendDue handles it at once.
    const next = unsent()[0];
    if (!next || stopped) return;
    alertTimer = setTimeout(() => {
      void sendDue().then(arm, arm);
    }, Math.min(Math.max(0, next.at - Date.now()), MAX_TIMER_MS));
  }

  function armMidnight(): void {
    clearTimeout(midnightTimer);
    const n = new Date();
    const next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 1).getTime();
    midnightTimer = setTimeout(() => void replan(), Math.min(next - n.getTime(), MAX_TIMER_MS));
  }

  async function plannedOnce(): Promise<void> {
    armMidnight();
    if (push.count() === 0) {
      plan = [];
      arm();
      return;
    }
    try {
      const now = new Date();
      const inputs = await load();
      plan = buildAlerts(now, isoDay(now), inputs.tasks, parseTimeBlock(inputs.daily));
    } catch {
      return; // keep the old plan; the next change re-plans
    }
    await sendDue();
    arm();
  }

  function replan(): Promise<void> {
    if (stopped) return Promise.resolve();
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        await plannedOnce();
      } while (again && !stopped);
    })().finally(() => {
      running = null;
    });
    return running;
  }

  return {
    replan,
    onChanges(events) {
      if (!events.some((e) => e.path.endsWith(".md"))) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => void replan(), DEBOUNCE_MS);
    },
    pending: unsent,
    stop() {
      stopped = true;
      clearTimeout(alertTimer);
      clearTimeout(midnightTimer);
      clearTimeout(debounce);
    },
  };
}
