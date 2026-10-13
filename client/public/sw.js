// Makes the app installable and shows notifications. It caches nothing: every
// request needs the token cookie and the notes are live.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/#!today";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((all) => (all[0] ? all[0].focus() : self.clients.openWindow(url))),
  );
});

// Web Push: always show something (Safari revokes a subscription that gets a push and shows nothing).
// The tag is the alert id, so two deliveries of one alert are one notification.
self.addEventListener("push", (e) => {
  let d = { title: "meta-notes" };
  try {
    if (e.data) d = e.data.json();
  } catch {
    d = { title: e.data.text() || "meta-notes" };
  }
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, tag: d.tag, data: { url: d.url } }));
});

// The browser dropped the subscription: make a new one and tell the server.
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil(
    fetch("/api/push/key")
      .then((r) => r.json())
      .then(({ key }) => self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }))
      .then((sub) =>
        fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) }),
      ),
  );
});
