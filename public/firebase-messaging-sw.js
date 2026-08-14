importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB7wdVXuFgrtXB6Q66pEyzJIr_QDv39aew",
  authDomain: "laundry-smart-sampayan.firebaseapp.com",
  projectId: "laundry-smart-sampayan",
  databaseURL:
    "https://laundry-smart-sampayan-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "laundry-smart-sampayan.firebasestorage.app",
  messagingSenderId: "780204813421",
  appId: "1:780204813421:web:68f1270b3aa66b4a38a364",
});

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
