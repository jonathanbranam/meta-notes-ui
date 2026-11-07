import { useCallback, useEffect, useState } from "react";
import { canceledItems, chooseList, gotItems, openGroups, readLastList, writeLastList, type ListFile, type ListItem, type ListSource } from "./lists";
import { ALL_LISTS_PATH, LISTS_PATH, listOf } from "./tabs";

interface ListsResponse {
  ok: boolean;
  lists: { list: string; name: string; date: string; items: number; open: number }[];
  current: string | null;
}

async function api<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(url, body === undefined ? undefined : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "Cannot reach the server" } as T;
  }
}

/**
 * The Lists page (design/specs/lists.md): the bare tab resolves to the current list, else the last
 * one shown; "All lists" is the index; a list shows its open items by group and a Got section.
 */
export function ListsView({
  path,
  refreshKey,
  go,
  openSource,
}: {
  path: string;
  refreshKey: number;
  go: (path: string, replace?: boolean) => void;
  openSource: (src: ListSource) => void;
}) {
  const list = listOf(path);
  const [index, setIndex] = useState<ListsResponse | null>(null);
  const [file, setFile] = useState<ListFile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void api<ListsResponse>("/api/lists").then((r) => {
      if (!r.ok) return setError("Cannot load the lists");
      setIndex(r);
      if (path === LISTS_PATH) {
        const pick = chooseList(r.current, readLastList(), r.lists.map((l) => l.list));
        go(pick ? `${LISTS_PATH}/${pick}` : ALL_LISTS_PATH, true);
      }
    });
  }, [path, refreshKey, go]);

  const load = useCallback(async () => {
    if (!list) return setFile(null);
    const r = await api<{ ok: boolean; error?: string } & ListFile>(`/api/list?path=${encodeURIComponent(list)}`);
    if (!r.ok) {
      setFile(null);
      return setError(r.error ?? "Cannot load the list");
    }
    setFile(r);
    writeLastList(list);
  }, [list]);
  useEffect(() => void load(), [load, refreshKey]);

  const toggle = async (item: ListItem) => {
    if (!list) return;
    const r = await api<{ ok: boolean; error?: string }>("/api/list/check", { list, n: item.number, expect: item.text, action: item.state === "open" ? "check" : "uncheck" });
    setError(r.ok ? "" : (r.error ?? "Cannot change the item"));
    await load();
  };

  const row = (item: ListItem) => (
    <li key={item.number} className={`item ${item.state}`}>
      <button className="box" role="checkbox" aria-checked={item.state === "done"} aria-label={item.text} disabled={item.state === "canceled"} onClick={() => void toggle(item)}>
        {item.state === "done" ? "x" : ""}
      </button>
      <span className="text">{item.text}</span>
      {item.source && (
        <button className="source" aria-label={`Open the task for ${item.text}`} onClick={() => openSource(item.source!)}>
          link
        </button>
      )}
    </li>
  );

  if (!list) {
    return (
      <section className="lists">
        <h2>All lists</h2>
        {error && <p className="error">{error}</p>}
        {index && index.lists.length === 0 && <p className="hint">No lists yet.</p>}
        <ul className="all">
          {index?.lists.map((l) => (
            <li key={l.list}>
              <button onClick={() => go(`${LISTS_PATH}/${l.list}`)}>
                {l.name} <span className="hint">{l.date} - {l.open} left of {l.items}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  const got = file ? gotItems(file) : [];
  const canceled = file ? canceledItems(file) : [];
  return (
    <section className="lists">
      <p>
        <button className="all-lists" onClick={() => go(ALL_LISTS_PATH)}>
          &lt; All lists
        </button>
      </p>
      {error && <p className="error">{error}</p>}
      {file && (
        <>
          <h2>{file.name}</h2>
          {openGroups(file).map((g) => (
            <div key={g.name ?? ""} className="group">
              {g.name && <h3>{g.name}</h3>}
              <ul>{g.items.map(row)}</ul>
            </div>
          ))}
          {got.length > 0 && (
            <div className="group got">
              <h3>Got</h3>
              <ul>{got.map(row)}</ul>
            </div>
          )}
          {canceled.length > 0 && (
            <div className="group canceled">
              <h3>Canceled</h3>
              <ul>{canceled.map(row)}</ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
