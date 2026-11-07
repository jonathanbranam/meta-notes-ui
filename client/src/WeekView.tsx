import { useEffect, useState } from "react";
import type { WeekResponse } from "../../server/week";
import { SLOT } from "../../shared/week";
import { boxClass, boxes, clockLabel, firstDay, RANGES, stepWeek, weekPath, type WeekPage } from "./week";

/** A task line without its checkbox and its date marks. */
export const taskLabel = (text: string) => text.replace(/^- \[.\]\s*/, "").replace(/\s*[\u23F0\u{1F4C5}\u23F3\u{1F6EB}].*$/u, "");

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayName = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return `${DAY_NAMES[new Date(y, m - 1, d).getDay()]} ${m}/${d}`;
};

/** The grid, rendering only what `/api/week` says (the cascade is the server's and shared/week.ts). */
export function WeekGrid({ week, today, nowMin }: { week: WeekResponse; today: string; nowMin: number }) {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  return (
    <div className="wk-grid" style={{ "--wk-days": week.days.length } as React.CSSProperties}>
      <div className="wk-head wk-corner" />
      {week.days.map((d) => (
        <div key={d.date} className={d.date === today ? "wk-head wk-today" : "wk-head"}>
          <div className="wk-dayname">{d.note ? <a href={`#${d.note}`}>{dayName(d.date)}</a> : dayName(d.date)}</div>
          {d.allDay.map((t) => (
            <div key={t} className="wk-allday">{t}</div>
          ))}
          {d.tasks.length > 0 && (
            <details className="wk-tasks">
              <summary>{d.tasks.length} due</summary>
              <ul>
                {d.tasks.map((t) => (
                  <li key={`${t.file}:${t.line}`}>{taskLabel(t.text)}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ))}
      <div className="wk-hours">
        {hours.map((h) => (
          <div key={h} className="wk-hour">{clockLabel(h * 60)}</div>
        ))}
      </div>
      {week.days.map((d) => {
        return (
          <div key={d.date} className="wk-col" data-date={d.date}>
            {boxes(d.slots).map((b) => {
              const isPast = d.date < today || (d.date === today && b.slot.at < nowMin);
              return (
                <div
                  key={b.from}
                  className={boxClass(b.slot, isPast)}
                  style={{ top: `calc(var(--wk-row) * ${b.from})`, height: `calc(var(--wk-row) * ${b.span})` }}
                  title={b.slot.error ? `${b.slot.error}: ${b.slot.text}` : b.slot.text}
                >
                  {b.slot.error && <span className="wk-label">{b.slot.error}</span>}
                  {b.slot.badge && <span className="wk-badge">{b.slot.badge}</span>}
                  <span className="wk-text">{b.slot.text}</span>
                </div>
              );
            })}
            {d.date === today && <div className="wk-now" style={{ top: `calc(var(--wk-row) * ${nowMin / SLOT})` }} />}
          </div>
        );
      })}
    </div>
  );
}

/** The week page: range picker, previous/next week and the grid; refetches on each live update. */
export function WeekView({ page, today, nowMin, refreshKey, go }: { page: WeekPage; today: string; nowMin: number; refreshKey: number; go: (path: string) => void }) {
  const [week, setWeek] = useState<WeekResponse | null>(null);
  const [error, setError] = useState("");
  const start = firstDay(page);
  useEffect(() => {
    let live = true;
    fetch(`/api/week?start=${start}&days=${page.days}`)
      .then((r) => (r.ok ? (r.json() as Promise<WeekResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((w) => {
        if (!live) return;
        setWeek(w);
        setError("");
      })
      .catch(() => live && setError("Cannot load the week"));
    return () => {
      live = false;
    };
  }, [start, page.days, refreshKey]);
  return (
    <section className="wk">
      <div className="wk-bar">
        <button onClick={() => go(weekPath(stepWeek(page, -1)))} aria-label="Previous week">&lsaquo; Week</button>
        <button onClick={() => go(weekPath(stepWeek(page, 1)))} aria-label="Next week">Week &rsaquo;</button>
        <span className="wk-ranges" role="group" aria-label="Days shown">
          {RANGES.map((r) => (
            <button key={r.days} className={r.days === page.days ? "on" : ""} aria-pressed={r.days === page.days} onClick={() => go(weekPath({ ...page, days: r.days }))}>
              {r.label}
            </button>
          ))}
        </span>
        <span className="hint">{start}</span>
      </div>
      {error && <p className="error">{error}</p>}
      {!error && !(week && week.start === start && week.days.length === page.days) && <p className="hint">Loading...</p>}
      {week && week.start === start && week.days.length === page.days && <WeekGrid week={week} today={today} nowMin={nowMin} />}
    </section>
  );
}
