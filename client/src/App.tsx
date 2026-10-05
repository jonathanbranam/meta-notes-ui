import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BacklinksResponse, ChangeEvent, NoteResponse, TreeNode } from "../../shared/types";
import { isOpen, metaNotes, parseFrontmatter } from "./markdown";
import { FiredAlerts, TODAY_PATH, TodayView, useToday } from "./TodayView";
import { flattenFiles, frontmatterLines, quickOpen, stripFrontmatter } from "./notes";

const pad = (n: number) => String(n).padStart(2, "0");
function clock(d: Date) {
  return { today: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, nowMinutes: d.getHours() * 60 + d.getMinutes() };
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return (await res.json()) as T;
}

/** POST JSON to an edit route; a refusal comes back as `{ok: false, error, current?}`. */
async function postJson(url: string, body: unknown): Promise<{ ok: boolean; error?: string; current?: unknown }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as { ok: boolean; error?: string; current?: unknown };
  } catch {
    return { ok: false, error: "Cannot reach the server" };
  }
}

interface Edit {
  /** File lines, 1-based inclusive. */
  from: number;
  to: number;
  /** The lines as loaded. */
  expect: string;
  /** Set when a save was refused: the lines as they are now. */
  current?: string;
  error?: string;
}

interface EditApi {
  lineOffset: number;
  edit: Edit | null;
  start: (from: number, to: number) => void;
  save: (draft: string) => void;
  cancel: () => void;
  toggleTask: (line: number, status: string) => void;
}
const EditCtx = createContext<EditApi | null>(null);

function Editor({ edit, onSave, onCancel }: { edit: Edit; onSave: (draft: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(edit.expect);
  return (
    <div className="editor">
      <textarea autoFocus value={draft} rows={Math.max(3, draft.split("\n").length + 1)} onChange={(e) => setDraft(e.target.value)} />
      {edit.error && <p className="error">{edit.error}</p>}
      {edit.current !== undefined && (
        <div className="conflict">
          <p>This changed while you were editing. It is now:</p>
          <pre>{edit.current}</pre>
        </div>
      )}
      <button onClick={() => onSave(draft)}>{edit.current !== undefined ? "Save over it" : "Save"}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

type BlockProps = { node?: { position?: { start: { line: number }; end: { line: number } } }; children?: ReactNode } & Record<string, unknown>;

/** A paragraph, list item or table: double-click opens its raw lines for editing; clicking a task's box toggles it. */
function block(Tag: "p" | "li" | "table") {
  return function Block({ node, children, ...rest }: BlockProps) {
    const api = useContext(EditCtx)!;
    const pos = node?.position;
    if (!pos) return <Tag {...(rest as object)}>{children}</Tag>;
    const from = pos.start.line + api.lineOffset;
    const to = pos.end.line + api.lineOffset;
    if (api.edit && api.edit.from === from && api.edit.to === to) return <Editor edit={api.edit} onSave={api.save} onCancel={api.cancel} />;
    const status = rest["data-status"] as string | undefined;
    return (
      <Tag
        {...(rest as object)}
        onDoubleClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          api.start(from, to);
        }}
        onClick={
          Tag === "li" && status !== undefined
            ? (e: React.MouseEvent) => {
                // The box is the item's ::before, so a click on the item itself.
                if (e.target === e.currentTarget) api.toggleTask(from, status);
              }
            : undefined
        }
      >
        {children}
      </Tag>
    );
  };
}
const COMPONENTS = { p: block("p"), li: block("li"), table: block("table") } as unknown as Components;

function TreeView({ nodes, current, onOpen }: { nodes: TreeNode[]; current: string; onOpen: (p: string) => void }) {
  return (
    <ul className="tree">
      {nodes.map((n) =>
        n.type === "dir" ? (
          <Folder key={n.path} node={n} current={current} onOpen={onOpen} />
        ) : (
          <li key={n.path}>
            <button className={n.path === current ? "file current" : "file"} onClick={() => onOpen(n.path)}>
              {n.name.replace(/\.md$/, "")}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

function Folder({ node, current, onOpen }: { node: TreeNode; current: string; onOpen: (p: string) => void }) {
  const [open, setOpen] = useState(current.startsWith(node.path + "/"));
  return (
    <li>
      <button className="folder" onClick={() => setOpen(!open)}>
        {open ? "▾" : "▸"} {node.name}
      </button>
      {open && <TreeView nodes={node.children ?? []} current={current} onOpen={onOpen} />}
    </li>
  );
}

function QuickOpen({ files, onOpen, onClose }: { files: TreeNode[]; onOpen: (p: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => quickOpen(files, query), [files, query]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="quick" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="Open note by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && hits[0]) onOpen(hits[0].path);
          }}
        />
        <ul>
          {hits.map((f) => (
            <li key={f.path}>
              <button onClick={() => onOpen(f.path)}>{f.path.replace(/\.md$/, "")}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function App() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [path, setPath] = useState(() => decodeURIComponent(location.hash.slice(1)));
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState(false);
  const [backlinks, setBacklinks] = useState<string[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const todayState = useToday(refreshKey, now);
  const pathRef = useRef(path);
  pathRef.current = path;

  const loadTree = useCallback(() => getJson<TreeNode[]>("/api/tree").then(setTree).catch(() => {}), []);
  const loadNote = useCallback(() => {
    const p = pathRef.current;
    if (!p || p === TODAY_PATH) return setNote(null);
    getJson<NoteResponse>(`/api/note?path=${encodeURIComponent(p)}`)
      .then((n) => {
        setNote(n);
        setError("");
      })
      .catch(() => {
        setNote(null);
        setError(`Cannot open ${p}`);
      });
  }, []);

  const loadBacklinks = useCallback(() => {
    const p = pathRef.current;
    if (!p || p === TODAY_PATH) return setBacklinks([]);
    getJson<BacklinksResponse>(`/api/backlinks?path=${encodeURIComponent(p)}`)
      .then((b) => setBacklinks(b.backlinks))
      .catch(() => setBacklinks([]));
  }, []);

  const open = useCallback((p: string) => {
    location.hash = encodeURIComponent(p).replace(/%2F/g, "/");
    setPath(p);
    setDrawer(false);
    setQuick(false);
  }, []);

  useEffect(() => {
    const onHash = () => setPath(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(loadNote, [path, loadNote]);
  useEffect(loadBacklinks, [path, loadBacklinks]);
  // Keeps the Time Block's current row on the right quarter hour.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => void loadTree(), [loadTree]);

  // Live updates: re-fetch the tree on add/remove and the open note when it changes.
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (m) => {
      const e = JSON.parse(m.data) as ChangeEvent;
      if (e.type !== "changed") void loadTree();
      if (e.path === pathRef.current) loadNote();
      setRefreshKey((k) => k + 1);
      loadBacklinks();
    };
    return () => es.close();
  }, [loadTree, loadNote, loadBacklinks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuick(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [edit, setEdit] = useState<Edit | null>(null);
  useEffect(() => setEdit(null), [path]);
  const editApi = useMemo<EditApi>(() => {
    const lines = note ? note.text.split("\n") : [];
    const text = (from: number, to: number) => lines.slice(from - 1, to).join("\n");
    return {
      lineOffset: note ? frontmatterLines(note.text) : 0,
      edit,
      start: (from, to) => setEdit({ from, to, expect: text(from, to) }),
      cancel: () => setEdit(null),
      save: async (draft) => {
        if (!edit) return;
        const r = await postJson("/api/write", { path, from: edit.from, to: edit.to, expect: edit.expect, text: draft });
        if (r.ok) {
          setEdit(null);
          loadNote();
        } else if (Array.isArray(r.current)) {
          // Refused: show what is there now; "Save over it" retries against that.
          const current = (r.current as string[]).join("\n");
          setEdit({ ...edit, expect: current, current, error: undefined });
        } else setEdit({ ...edit, error: r.error ?? "Save failed" });
      },
      toggleTask: async (line, status) => {
        const r = await postJson("/api/task", { path, line, expect: lines[line - 1], status: isOpen(status) ? "x" : " " });
        if (!r.ok) setError(r.error ?? "Cannot update the task");
        loadNote();
      },
    };
  }, [note, edit, path, loadNote]);

  const newNote = async () => {
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
    const name = window.prompt("New note path (from the notes root):", dir);
    if (!name) return;
    const rel = name.endsWith(".md") ? name : `${name}.md`;
    const r = await postJson("/api/new", { path: rel });
    if (r.ok) open(rel);
    else setError(r.error ?? "Cannot create the note");
  };

  const files = useMemo(() => flattenFiles(tree), [tree]);
  const filePaths = useMemo(() => new Set(files.map((f) => f.path)), [files]);
  const { today, nowMinutes } = clock(now);
  const plugins = useMemo(
    () => [remarkGfm, metaNotes({ path, files: filePaths, today, nowMinutes })],
    [path, filePaths, today, nowMinutes],
  );
  const props = useMemo(() => (note ? parseFrontmatter(note.text) : []), [note]);

  const openToday = () => open(TODAY_PATH);
  const openDaily = () =>
    getJson<{ path: string }>("/api/daily")
      .then((d) => open(d.path))
      .catch(() => setError("Cannot find today's daily note"));

  return (
    <div className="app">
      <header>
        <button className="menu" onClick={() => setDrawer(!drawer)} aria-label="Files">
          ☰
        </button>
        <span className="title">{path === TODAY_PATH ? "Today" : path.replace(/\.md$/, "") || "meta-notes"}</span>
        <button onClick={openToday}>Today</button>
        <button onClick={openDaily}>Daily</button>
        <button onClick={newNote}>New</button>
        <button onClick={() => setQuick(true)}>Open…</button>
      </header>
      <nav className={drawer ? "drawer open" : "drawer"}>
        <TreeView nodes={tree} current={path} onOpen={open} />
      </nav>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <main>
        <FiredAlerts fired={todayState.fired} dismiss={todayState.dismiss} snooze={todayState.snooze} />
        {error && <p className="error">{error}</p>}
        {path === TODAY_PATH ? (
          <TodayView today={todayState} now={now} open={open} />
        ) : note ? (
          <article className="note">
            {props.length > 0 && (
              <dl className="props">
                {props.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <EditCtx.Provider value={editApi}>
              <ReactMarkdown remarkPlugins={plugins} components={COMPONENTS}>
                {stripFrontmatter(note.text)}
              </ReactMarkdown>
            </EditCtx.Provider>
            {backlinks.length > 0 && (
              <section className="backlinks">
                <h4>Backlinks</h4>
                <ul>
                  {backlinks.map((b) => (
                    <li key={b}>
                      <a href={`#${encodeURIComponent(b).replace(/%2F/g, "/")}`}>{b.replace(/\.md$/, "")}</a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        ) : (
          !error && <p className="hint">Pick a note from the tree, or press Ctrl+K.</p>
        )}
      </main>
      {quick && <QuickOpen files={files} onOpen={open} onClose={() => setQuick(false)} />}
    </div>
  );
}
