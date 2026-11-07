import { TABS, type TabId } from "./tabs";

/** The mobile bottom tab bar; the caller renders it on a phone only. */
export function TabBar({ active, onPick }: { active: TabId; onPick: (t: TabId) => void }) {
  return (
    <nav className="tabbar" aria-label="Pages">
      {TABS.map((t) => (
        <button key={t.id} className={t.id === active ? "active" : ""} aria-current={t.id === active ? "page" : undefined} onClick={() => onPick(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
