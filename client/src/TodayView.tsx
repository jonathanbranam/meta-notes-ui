import { AddTask } from "./AddTask";
import { TimeLogPanel } from "./TimeLog";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { TodayResponse } from "../../shared/types";
import { EditableCell, RowsEditor } from "./TimeCell";
import { inlineSegments, type RenderContext } from "./markdown";
import { buildAlerts, currentRow, parseTimeBlock, type Alert } from "./today";

export const TODAY_PATH = "!today";
const SNOOZE_MIN = 10;

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Show a notification; through the service worker where there is one (Android needs it). */
async function notify(a: Alert): Promise<void> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg) await reg.showNotification(a.title, { tag: a.id });
  else new Notification(a.title, { tag: a.id });
}

/**
 * Today's data, re-fetched when `refreshKey` changes (a file changed), and the
 * alerts built from it. Timers are client-side: one setTimeout per upcoming
 * alert, and a snooze is one more; the server does nothing while idle.
 */
export function useToday(refreshKey: number, now: Date) {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [error, setError] = useState("");
  const [fired, setFired] = useState<Alert[]>([]);
  const day = isoDay(now);
  const done = useRef(new Set<string>());
  const snoozes = useRef(new Map<string, number>());

  useEffect(() => {
    // Debounced: each fetch runs the CLI, and edits come in bursts.
    const t = setTimeout(load, refreshKey === 0 ? 0 : 1000);
    return () => clearTimeout(t);
    function load() {
      fetch("/api/today")
        .then((r) => (r.ok ? (r.json() as Promise<TodayResponse>) : Promise.reject(new Error(`${r.status}`))))
        .then((d) => {
          setData(d);
          setError("");
        })
        .catch(() => setError("Cannot load today"));
    }
  }, [refreshKey, day]);

  const fire = useCallback((a: Alert) => {
    setFired((f) => [...f.filter((x) => x.id !== a.id), a]);
    void notify(a);
  }, []);

  useEffect(() => {
    done.current.clear();
  }, [day]);

  const alerts = data ? buildAlerts(new Date(), day, data.tasks, parseTimeBlock(data.daily?.text ?? "")) : [];
  // Rebuilt on each data change; an alert fires once per day however often the data reloads.
  useEffect(() => {
    const timers = alerts
      .filter((a) => a.at > Date.now() && !done.current.has(a.id))
      .map((a) =>
        window.setTimeout(() => {
          done.current.add(a.id);
          fire(a);
        }, a.at - Date.now()),
      );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `alerts` is derived from `data` and `day`
  }, [data, day, fire]);

  useEffect(() => () => snoozes.current.forEach(clearTimeout), []);

  const dismiss = (id: string) => setFired((f) => f.filter((x) => x.id !== id));
  const snooze = (a: Alert) => {
    dismiss(a.id);
    clearTimeout(snoozes.current.get(a.id));
    snoozes.current.set(a.id, window.setTimeout(() => fire(a), SNOOZE_MIN * 60_000));
  };

  return { data, error, fired, alerts, dismiss, snooze };
}

export function FiredAlerts({ fired, dismiss, snooze }: Pick<ReturnType<typeof useToday>, "fired" | "dismiss" | "snooze">) {
  if (!fired.length) return null;
  return (
    <ul className="alerts">
      {fired.map((a) => (
        <li key={a.id}>
          <span>{a.title}</span>
          <button onClick={() => snooze(a)}>Snooze {SNOOZE_MIN} min</button>
          <button onClick={() => dismiss(a.id)}>Dismiss</button>
        </li>
      ))}
    </ul>
  );
}

/** One line of text with its wiki links and URLs as links; a wiki link opens its note in the app. */
export function Inline({ text, ctx, open }: { text: string; ctx: RenderContext; open: (p: string) => void }) {
  return (
    <>
      {inlineSegments(text, ctx).map((s, i) => {
        const node = s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.text}</a>
        ) : s.href ? (
          <a href={s.href} className="wikilink" onClick={() => open(decodeURIComponent(s.href!.slice(1).split("#")[0]))}>{s.text}</a>
        ) : s.missing ? (
          <span className="wikilink missing" title="No such note">{s.text}</span>
        ) : (
          s.text
        );
        return s.struck ? <del key={i}>{node}</del> : <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

export function TodayView({ today, now, open, files }: { today: ReturnType<typeof useToday>; now: Date; open: (p: string) => void; files: ReadonlySet<string> }) {
  const { data, error } = today;
  const [editRows, setEditRows] = useState(false);
  const [perm, setPerm] = useState(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="hint">Loading…</p>;
  const rows = parseTimeBlock(data.daily?.text ?? "");
  const cur = currentRow(rows, now.getHours() * 60 + now.getMinutes());
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = rows.findIndex((r, i) => i > cur && r.minutes > nowMin && r.plan.trim() !== "" && !/^no plan$/i.test(r.plan.trim()));
  const day = isoDay(now);
  const ctxFor = (path: string): RenderContext => ({ path, files, today: day, nowMinutes: nowMin });
  return (
    <article className="note today">
      <h2>Today, {day}</h2>
      {perm === "default" && (
        <p>
          <button className="primary" onClick={() => void Notification.requestPermission().then(setPerm)}>
            Enable alerts
          </button>
        </p>
      )}
      {perm === "denied" && <p className="hint">Alerts are blocked in this browser.</p>}
      {perm === "unsupported" && <p className="hint">This browser cannot show notifications.</p>}

      <h3>Time Block</h3>
      {rows.length === 0 ? (
        <p className="hint">No Time Block in today's note.</p>
      ) : (
        <table className="timeblock">
          <thead>
            <tr><th>Time</th><th>Plan</th><th>Actual</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.minutes} className={[i === cur ? "now" : "", /^no plan$/i.test(r.plan.trim()) ? "noplan" : "", i === next ? "next" : ""].join(" ").trim()}>
                <td>{r.time}</td>
                <EditableCell path={data.daily!.path} time={r.time} column="plan" text={r.plan}><Inline text={r.plan} ctx={ctxFor(data.daily!.path)} open={open} /></EditableCell>
                <EditableCell path={data.daily!.path} time={r.time} column="actual" text={r.actual}><Inline text={r.actual} ctx={ctxFor(data.daily!.path)} open={open} /></EditableCell>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.daily && rows.length > 0 && (editRows ? (
        <RowsEditor path={data.daily.path} rows={rows.map((r) => r.line)} onClose={() => setEditRows(false)} />
      ) : (
        <p><button onClick={() => setEditRows(true)}>Edit rows</button></p>
      ))}
      {data.daily && <TimeLogPanel path={data.daily.path} text={data.daily.text} />}
      {!data.daily && <p className="hint">No daily note for today yet.</p>}
      {data.daily && (
        <p>
          <a href={`#${encodeURIComponent(data.daily.path).replace(/%2F/g, "/")}`} onClick={() => open(data.daily!.path)}>
            Open the daily note
          </a>
        </p>
      )}
      {data.daily && <AddTask path={data.daily.path} />}

      <h3>Due and overdue</h3>
      {data.tasks.length === 0 ? (
        <p className="hint">Nothing due.</p>
      ) : (
        <ul className="duetasks">
          {data.tasks.map((t) => (
            <li key={`${t.file}:${t.line}`} className={t.due && t.due < day ? "overdue" : ""}>
              <Inline text={t.text.replace(/^\s*- \[.\]\s*/, "")} ctx={ctxFor(t.file)} open={open} /> <a href={`#${encodeURIComponent(t.file).replace(/%2F/g, "/")}`} onClick={() => open(t.file)}>{t.file.replace(/\.md$/, "")}</a>
            </li>
          ))}
        </ul>
      )}

      {data.agenda && (
        <>
          <h3>Agenda</h3>
          {data.agenda.length === 0 ? (
            <p className="hint">No events.</p>
          ) : (
            <ul>
              {data.agenda.map((e, i) => (
                <li key={i}>
                  {e.all_day ? "all day" : `${e.start.slice(11, 16)}–${e.end.slice(11, 16)}`} {e.title}
                  {e.location ? ` (${e.location})` : ""}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  );
}
