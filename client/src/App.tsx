import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChangeEvent, NoteResponse, TreeNode } from "../../shared/types";
import { flattenFiles, quickOpen, stripFrontmatter } from "./notes";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return (await res.json()) as T;
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
  const [path, setPath] = useState(() => decodeURIComponent(location.hash.slice(1)));
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState(false);
  const pathRef = useRef(path);
  pathRef.current = path;

  const loadTree = useCallback(() => getJson<TreeNode[]>("/api/tree").then(setTree).catch(() => {}), []);
  const loadNote = useCallback(() => {
    const p = pathRef.current;
    if (!p) return setNote(null);
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
  useEffect(() => void loadTree(), [loadTree]);

  // Live updates: re-fetch the tree on add/remove and the open note when it changes.
  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (m) => {
      const e = JSON.parse(m.data) as ChangeEvent;
      if (e.type !== "changed") void loadTree();
      if (e.path === pathRef.current) loadNote();
    };
    return () => es.close();
  }, [loadTree, loadNote]);

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

  const files = useMemo(() => flattenFiles(tree), [tree]);

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
        <span className="title">{path.replace(/\.md$/, "") || "meta-notes"}</span>
        <button onClick={openDaily}>Today</button>
        <button onClick={() => setQuick(true)}>Open…</button>
      </header>
      <nav className={drawer ? "drawer open" : "drawer"}>
        <TreeView nodes={tree} current={path} onOpen={open} />
      </nav>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <main>
        {error && <p className="error">{error}</p>}
        {note ? (
          <article className="note">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripFrontmatter(note.text)}</ReactMarkdown>
          </article>
        ) : (
          !error && <p className="hint">Pick a note from the tree, or press Ctrl+K.</p>
        )}
      </main>
      {quick && <QuickOpen files={files} onOpen={open} onClose={() => setQuick(false)} />}
    </div>
  );
}
