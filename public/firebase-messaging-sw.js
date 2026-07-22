importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

/**
 * Attaches Firebase background message handler after Firebase has been initialized.
 * Called once the INIT_FIREBASE postMessage is received from the main app thread.
 */
function attachBackgroundMessageHandler() {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || "Laun-Dry Alert";
    const notificationOptions = {
      body:
        payload.notification?.body ||
        payload.data?.message ||
        "Automated system update.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "INIT_FIREBASE") return;
  if (firebase.apps.length > 0) return;

  firebase.initializeApp(event.data.config);
  attachBackgroundMessageHandler();
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/notifications");
        }
      }),
  );
});
