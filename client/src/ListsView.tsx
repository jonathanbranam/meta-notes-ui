import { listOf } from "./tabs";

/** The Lists page. The shell only: the lists themselves come with the Lists content ticket. */
export function ListsView({ path, onAll }: { path: string; onAll: () => void }) {
  const list = listOf(path);
  return (
    <section className="lists">
      <p>
        <button className="all-lists" onClick={onAll} disabled={list === null}>
          &lt; All lists
        </button>
      </p>
      <p className="hint">{list === null ? "No lists yet." : `No list at ${list}.`}</p>
    </section>
  );
}
