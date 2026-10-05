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
