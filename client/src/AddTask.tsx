import { useState } from "react";

/** A text field and an optional due date that add a task to `path` (the file watcher refreshes the view). */
export function AddTask({ path }: { path: string }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch("/api/task/add", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, text, due }) });
      const r = (await res.json()) as { ok: boolean; error?: string };
      if (!r.ok) return setError(r.error ?? "Cannot add the task");
      setError("");
      setText("");
      setDue("");
    } catch {
      setError("Cannot reach the server");
    }
  };
  return (
    <form className="add-task" onSubmit={(e) => (e.preventDefault(), submit())}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task" aria-label="New task" />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
      <button type="submit" disabled={!text.trim()}>Add</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
