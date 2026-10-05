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
