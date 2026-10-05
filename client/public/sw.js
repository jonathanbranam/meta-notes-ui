// Makes the app installable and shows notifications. It caches nothing: every
// request needs the token cookie and the notes are live.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((all) => (all[0] ? all[0].focus() : self.clients.openWindow("/#!today"))),
  );
});
