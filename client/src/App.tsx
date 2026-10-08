import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingSlug, parseHash } from "../../shared/links";
import type { BacklinksResponse, ChangeEvent, NoteResponse, TreeNode } from "../../shared/types";
import { isOpen, metaNotes, statusName, parseFrontmatter, valueSegments, type PropValue, type RenderContext } from "./markdown";
import { AddTask } from "./AddTask";
import { EditableCell, rowCells } from "./TimeCell";
import { FiredAlerts, TODAY_PATH, TodayView, useToday } from "./TodayView";
import { embedImages, fileUrl, flattenFiles, frontmatterLines, isImage, isNote, quickOpen, resolveFile, stripFrontmatter } from "./notes";

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
  path: string;
  /** The note's lines, for the raw text of a Time Block cell. */
  lines: string[];
  lineOffset: number;
  edit: Edit | null;
  start: (from: number, to: number) => void;
  save: (draft: string) => void;
  cancel: () => void;
  toggleTask: (line: number, status: string) => void;
  setStatus: (line: number, status: string) => void;
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

/** A frontmatter value: lists as lists, maps as nested properties, `[[links]]` as links. */
function PropView({ value, ctx }: { value: PropValue; ctx: RenderContext }) {
  if (typeof value === "string")
    return (
      <>
        {valueSegments(value, ctx).map((s, i) =>
          s.href ? (
            <a key={i} href={s.href} className="wikilink">{s.text}</a>
          ) : s.missing ? (
            <span key={i} className="wikilink missing" title="No such note">{s.text}</span>
          ) : (
            s.text
          ),
        )}
      </>
    );
  if (Array.isArray(value))
    return (
      <ul className="prop-list">
        {value.map((v, i) => (
          <li key={i}><PropView value={v} ctx={ctx} /></li>
        ))}
      </ul>
    );
  return (
    <dl className="prop-map">
      {Object.entries(value).map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd><PropView value={v} ctx={ctx} /></dd>
        </div>
      ))}
    </dl>
  );
}

type BlockProps = { node?: { position?: { start: { line: number }; end: { line: number } } }; children?: ReactNode } & Record<string, unknown>;

/** The statuses the picker offers: the character `meta-notes task update --status` takes, and its label. */
const STATUS_OPTIONS: [string, string][] = [[" ", "Open"], ["x", "Done"], [">", "Rescheduled"], ["-", "Canceled"], ["o", "Partial"]];
const STATUS_CHAR: Record<string, string> = { open: " ", done: "x", moved: ">", canceled: "-", partial: "o" };

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
        {Tag === "li" && status !== undefined && (
          <select
            className="status-pick"
            aria-label="Task status"
            value={STATUS_CHAR[statusName(status)]}
            onChange={(e) => api.setStatus(from, e.target.value)}
          >
            {STATUS_OPTIONS.map(([c, label]) => (
              <option key={c} value={c}>{label}</option>
            ))}
          </select>
        )}
      </Tag>
    );
  };
}
/** A Time Block Plan or Actual cell (marked `data-col` by the renderer): tap to edit it through `time-block update`. */
function TimeBlockCell({ node, children, ...rest }: BlockProps) {
  const api = useContext(EditCtx)!;
  const col = rest["data-col"] as "plan" | "actual" | undefined;
  const line = node?.position ? node.position.start.line + api.lineOffset : 0;
  const cells = col && line ? rowCells(api.lines[line - 1] ?? "") : [];
  if (!col || !cells.length) return <td {...(rest as object)}>{children}</td>;
  return (
    <EditableCell path={api.path} time={cells[0]} column={col} text={cells[col === "plan" ? 1 : 2] ?? ""}>
      {children}
    </EditableCell>
  );
}
const COMPONENTS = { p: block("p"), li: block("li"), table: block("table"), td: TimeBlockCell } as unknown as Components;

/** A file that is not a note: images inline, text as text, PDFs and the rest as links to the raw file. */
function FileView({ path }: { path: string }) {
  const [text, setText] = useState<string | null>(null);
  const isText = path.endsWith(".txt");
  useEffect(() => {
    setText(null);
    if (isText) fetch(fileUrl(path)).then((r) => r.text()).then(setText).catch(() => setText("Cannot read the file"));
  }, [path, isText]);
  return (
    <article className="note">
      {isImage(path) ? (
        <img className="file-image" src={fileUrl(path)} alt={path} />
      ) : isText ? (
        <pre>{text ?? ""}</pre>
      ) : (
        <p>
          <a href={fileUrl(path)} target="_blank" rel="noreferrer" {...(path.endsWith(".pdf") ? {} : { download: path.split("/").pop() })}>
            {path.endsWith(".pdf") ? "Open the PDF" : "Download"} {path.split("/").pop()}
          </a>
        </p>
      )}
    </article>
  );
}

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
  const [target, setTarget] = useState(() => parseHash(decodeURIComponent(location.hash.slice(1))));
  const path = target.path;
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
    if (!p || p === TODAY_PATH || !isNote(p)) return setNote(null);
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
    if (!p || p === TODAY_PATH || !isNote(p)) return setBacklinks([]);
    getJson<BacklinksResponse>(`/api/backlinks?path=${encodeURIComponent(p)}`)
      .then((b) => setBacklinks(b.backlinks))
      .catch(() => setBacklinks([]));
  }, []);

  const open = useCallback((p: string) => {
    location.hash = encodeURIComponent(p).replace(/%2F/g, "/");
    setTarget({ path: p });
    setDrawer(false);
    setQuick(false);
  }, []);

  useEffect(() => {
    const onHash = () => setTarget(parseHash(decodeURIComponent(location.hash.slice(1))));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Scrolls to a `[[path#heading]]` link's heading once the note is shown.
  useEffect(() => {
    if (!target.heading || !note || note.path !== path) return;
    const h = [...document.querySelectorAll<HTMLElement>("article.note :is(h1,h2,h3,h4,h5,h6)")].find((e) => headingSlug(e.textContent ?? "") === target.heading);
    h?.scrollIntoView();
  }, [target, note, path]);

  useEffect(loadNote, [path, loadNote]);
  useEffect(loadBacklinks, [path, loadBacklinks]);
  // Keeps the Time Block's current row on the right quarter hour.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => void loadTree(), [loadTree]);

  // Live updates: re-fetch the tree on add/remove and the open note when it changes. Backlinks only
  // when a note may have changed them; after a reconnect (events were missed) everything is re-fetched.
  useEffect(() => {
    const es = new EventSource("/api/events");
    let opened = false;
    es.onopen = () => {
      if (opened) {
        void loadTree();
        loadNote();
        loadBacklinks();
        setRefreshKey((k) => k + 1);
      }
      opened = true;
    };
    es.onmessage = (m) => {
      const e = JSON.parse(m.data) as ChangeEvent;
      if (e.type !== "changed") void loadTree();
      if (e.path === pathRef.current) loadNote();
      setRefreshKey((k) => k + 1);
      if (e.path.endsWith(".md")) loadBacklinks();
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
  // A disk change under an open editor shows as a conflict at once; the draft stays.
  useEffect(() => {
    if (!note) return;
    const lines = note.text.split("\n");
    setEdit((ed) => {
      if (!ed) return ed;
      const cur = lines.slice(ed.from - 1, ed.to).join("\n");
      return cur === ed.expect ? ed : { ...ed, expect: cur, current: cur, error: undefined };
    });
  }, [note]);
  const editApi = useMemo<EditApi>(() => {
    const lines = note ? note.text.split("\n") : [];
    const text = (from: number, to: number) => lines.slice(from - 1, to).join("\n");
    const setTaskStatus = async (line: number, status: string) => {
      const r = await postJson("/api/task", { path, line, expect: lines[line - 1], status });
      if (!r.ok) setError(r.error ?? "Cannot update the task");
      loadNote();
    };
    return {
      path,
      lines,
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
      toggleTask: (line, status) => setTaskStatus(line, isOpen(status) ? "x" : " "),
      setStatus: (line, status) => setTaskStatus(line, status),
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
  const [tagAliases, setTagAliases] = useState<Record<string, string>>({});
  useEffect(() => {
    getJson<Record<string, string>>("/api/tag-aliases").then(setTagAliases).catch(() => {});
  }, []);
  const ctx = useMemo(() => ({ path, files: filePaths, today, nowMinutes, tagAliases }), [path, filePaths, today, nowMinutes, tagAliases]);
  // Markdown images: a src relative to the note (or the root) becomes a raw-file URL.
  const components = useMemo(
    () => ({
      ...COMPONENTS,
      img: ({ src, alt }: { src?: string; alt?: string }) => {
        const found = src && !/^([a-z]+:|\/)/i.test(src) ? resolveFile(decodeURIComponent(src), path, filePaths) : null;
        return <img src={found ? fileUrl(found) : src} alt={alt ?? ""} />;
      },
    }) as Components,
    [path, filePaths],
  );
  const plugins = useMemo(() => [remarkGfm, metaNotes(ctx)], [ctx]);
  const props = useMemo(() => (note ? parseFrontmatter(note.text) : []), [note]);

  const openToday = () => open(TODAY_PATH);
  const openDaily = () =>
    getJson<{ path: string; exists: boolean }>("/api/daily")
      .then((d) => (d.exists ? open(d.path) : setError("No daily note for today yet")))
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
        ) : path && !isNote(path) ? (
          <FileView path={path} />
        ) : note ? (
          <article className="note">
            {props.length > 0 && (
              <dl className="props">
                {props.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>
                      <PropView value={v} ctx={ctx} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <EditCtx.Provider value={editApi}>
              <ReactMarkdown remarkPlugins={plugins} components={components}>
                {embedImages(stripFrontmatter(note.text), path, filePaths)}
              </ReactMarkdown>
            </EditCtx.Provider>
            <AddTask path={path} />
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
