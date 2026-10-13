// Web Push from the page: subscribe on "Enable alerts", re-post the subscription on load, unsubscribe on "Alerts off".
// The server sends every alert to a subscribed device, so a subscribed page skips its own system notification.

let subscribed = false;

/** Does this device have a push subscription (then the server shows its alerts, not the page)? */
export const isPushSubscribed = () => subscribed;

const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function registration() {
  return typeof navigator !== "undefined" && "PushManager" in window ? navigator.serviceWorker?.ready : undefined;
}

const post = (sub: PushSubscription) =>
  fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) });

/** On load: re-post an existing subscription (a server that lost its file learns it again). Resolves to whether this device is subscribed. */
export async function syncPush(): Promise<boolean> {
  try {
    const sub = await (await registration())?.pushManager.getSubscription();
    if (sub) await post(sub);
    subscribed = !!sub;
  } catch {
    subscribed = false;
  }
  return subscribed;
}

/** Does the server have push on (a --push-contact) and does this browser support it? */
export async function pushAvailable(): Promise<boolean> {
  if (!(await registration())) return false;
  return (await fetch("/api/push/key").catch(() => null))?.ok === true;
}

/** Subscribe this device; must run from a tap on iOS. Resolves to an error message, or "" on success. */
export async function enablePush(): Promise<string> {
  try {
    const reg = await registration();
    const key = (await (await fetch("/api/push/key")).json()).key as string;
    const old = await reg!.pushManager.getSubscription();
    await old?.unsubscribe(); // a changed server key makes subscribe fail loudly; start clean
    const sub = await reg!.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key) });
    const res = await post(sub);
    if (!res.ok) return "The server refused the subscription";
    subscribed = true;
    return "";
  } catch (e) {
    return `Cannot enable alerts: ${(e as Error).message}`;
  }
}

export async function disablePush(): Promise<void> {
  const sub = await (await registration())?.pushManager.getSubscription();
  if (sub) {
    await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
    await sub.unsubscribe();
  }
  subscribed = false;
}
