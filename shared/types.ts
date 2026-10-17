export interface TreeNode {
  name: string;
  /** Path relative to the notes root, `/`-separated. */
  path: string;
  type: "dir" | "file";
  children?: TreeNode[];
}

export interface NoteResponse {
  path: string;
  text: string;
  mtime: number;
}

export interface ChangeEvent {
  type: "changed" | "added" | "removed";
  path: string;
}

export interface ServerInfo {
  pid: number;
  host: string;
  port: number;
  url: string;
  version: string;
}

export interface BacklinksResponse {
  /** Notes that link to the path, sorted. */
  backlinks: string[];
}

export interface TodayTask {
  file: string;
  line: number;
  text: string;
  due: string | null;
  /** `HH:MM` from `⏰`, or null. */
  time: string | null;
  section?: string;
}

/** `GET /api/tasks?tag=`: the open tasks with the tag, across all notes. */
export interface TagTasksResponse {
  tag: string;
  tasks: TodayTask[];
}

export interface AgendaEvent {
  start: string;
  end: string;
  all_day: boolean;
  title: string;
  location: string | null;
}

export interface TodayResponse {
  /** Today's daily note; null if meta-notes cannot name it. */
  daily: { path: string; text: string } | null;
  /** Open tasks due today or overdue. */
  tasks: TodayTask[];
  /** Today's calendar events; null when calendar is not set up. */
  agenda: AgendaEvent[] | null;
}

/** `GET /api/tag-aliases`: alias tag to canonical tag, as `meta-notes conventions --json` reports it; empty when unavailable. */
export type TagAliasesResponse = Record<string, string>;

/** A browser's Web Push subscription, as `PushSubscription.toJSON()` gives it. */
export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** What the service worker's `push` handler reads. `tag` is the alert id, so repeats replace each other. */
export interface PushPayload {
  title: string;
  body?: string;
  tag: string;
  url?: string;
}

/** What `sendPush` did: delivered, subscriptions removed as gone, and sends that failed. */
export interface PushResult {
  sent: number;
  removed: number;
  failed: number;
}
