import { useState } from "react";
import { messageBody, submitsOnKey } from "./tabs";

/** POST JSON; the error text on failure. Injected so the sheet is testable without a server. */
export type SendFn = (body: string) => Promise<{ ok: boolean; error?: string }>;

/**
 * The one message sheet, shared by Home and Lists: fire-and-forget to the notes aide with the page
 * attached. Enter sends (Shift+Enter is a new line), Send is a large button, and no reply is shown.
 */
export function MessageSheet({ context, send, onClose, onSent }: { context: string; send: SendFn; onClose: () => void; onSent: () => void }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    const r = await send(messageBody(text, context));
    setBusy(false);
    if (r.ok) onSent();
    else setErr(r.error ?? "Cannot send the message");
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="quick message-sheet" onClick={(e) => e.stopPropagation()}>
        <textarea
          autoFocus
          rows={6}
          placeholder="Message to the aide"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            else if (submitsOnKey({ key: e.key, shiftKey: e.shiftKey, isComposing: e.nativeEvent.isComposing })) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        {err && <p className="error">{err}</p>}
        <button className="send" disabled={busy || !text.trim()} onClick={() => void submit()}>
          Send
        </button>
      </div>
    </div>
  );
}
