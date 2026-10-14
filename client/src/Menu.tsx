import { type ReactNode, useEffect, useRef, useState } from "react";
import { alertsItem, closesMenu, type PushState } from "./menu";
import { disablePush, enablePush, pushAvailable, syncPush } from "./push";

/** The top bar's dropdown: the alerts control, then `items`; every pick closes the menu. */
export function Menu({ items }: { items: { label: string; run: () => void }[] }) {
  const [shown, setShown] = useState(false);
  const [push, setPush] = useState<PushState>("off");
  const [pushError, setPushError] = useState("");
  const [perm, setPerm] = useState(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void pushAvailable().then(async (ok) => {
      if (ok) setPush((await syncPush()) ? "on" : "available");
    });
  }, []);

  useEffect(() => {
    if (!shown) return;
    const key = (e: KeyboardEvent) => closesMenu({ type: "keydown", key: e.key }) && setShown(false);
    const press = (e: PointerEvent) => closesMenu({ type: "pointerdown", inside: !!box.current?.contains(e.target as Node) }) && setShown(false);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", press);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", press);
    };
  }, [shown]);

  const alerts = alertsItem(push, perm);
  const subscribe = () =>
    void enablePush().then((err) => {
      setPushError(err);
      if (!err) setPush("on");
    });
  const runAlerts = () => {
    if (alerts?.action === "disable") void disablePush().then(() => setPush("available"));
    else if (alerts?.action === "enable") subscribe();
    else if (alerts?.action === "ask")
      void Notification.requestPermission().then((p) => {
        setPerm(p);
        if (p === "granted" && push === "available") subscribe();
      });
  };
  const pick = (run: () => void) => () => {
    setShown(false);
    run();
  };

  let rows: ReactNode = null;
  if (shown)
    rows = (
      <ul className="menu-items" role="menu">
        {alerts && (
          <li role="none">
            {/* A permission prompt must run from this tap (iOS), so the alerts item runs its action directly. */}
            <button role="menuitem" disabled={!alerts.action} onClick={pick(runAlerts)}>{alerts.label}</button>
          </li>
        )}
        {items.map((it) => (
          <li key={it.label} role="none">
            <button role="menuitem" onClick={pick(it.run)}>{it.label}</button>
          </li>
        ))}
        {pushError && <li className="error">{pushError}</li>}
      </ul>
    );

  return (
    <div className="menu-box" ref={box}>
      <button className="menu-toggle" aria-haspopup="menu" aria-expanded={shown} aria-label="Menu" onClick={() => setShown(!shown)}>
        Menu
      </button>
      {rows}
    </div>
  );
}
