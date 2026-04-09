// importScripts(
//   "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
// );

// // 1. Initialize Firebase inside the Service Worker
// const firebaseConfig = {
//   apiKey: "AIzaSyAEFVxhBdqjvecjA_aj5TAD8lI30NPFglU",
//   authDomain: "zepo-c03d7.firebaseapp.com",
//   projectId: "zepo-c03d7",
//   storageBucket: "zepo-c03d7.firebasestorage.app",
//   messagingSenderId: "465436463784",
//   appId: "1:465436463784:web:d663dcaf80d8a84d29289d",
//   measurementId: "G-5NCKNW2SR4",
// };

// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// // Handle Background Messages
// messaging.onBackgroundMessage((payload) => {
//   console.log("[Admin SW] Received background message: ", payload);

//   if (payload.notification) return; // Let Firebase handle standard notifications automatically

//   const notificationTitle =
//     payload.data?.title || "Уведомление панели администратора";
//   const notificationOptions = {
//     body: payload.data?.body || "",
//     icon: "/favicon.ico",
//     data: { url: payload.data?.url || "/dashboard" },
//   };

//   return self.registration.showNotification(
//     notificationTitle,
//     notificationOptions,
//   );
// });

// // Handle Notification Clicks (Focus existing admin tab)
// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();
//   const urlToOpen = event.notification.data?.url || "/dashboard";

//   event.waitUntil(
//     clients
//       .matchAll({ type: "window", includeUncontrolled: true })
//       .then((windowClients) => {
//         for (let i = 0; i < windowClients.length; i++) {
//           const client = windowClients[i];
//           if (client.url.includes(self.location.origin) && "focus" in client) {
//             client.navigate(urlToOpen);
//             return client.focus();
//           }
//         }
//         if (clients.openWindow) return clients.openWindow(urlToOpen);
//       }),
//   );
// });

// Import Firebase scripts for the Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyAEFVxhBdqjvecjA_aj5TAD8lI30NPFglU",
  authDomain: "zepo-c03d7.firebaseapp.com",
  projectId: "zepo-c03d7",
  storageBucket: "zepo-c03d7.firebasestorage.app",
  messagingSenderId: "465436463784",
  appId: "1:465436463784:web:d663dcaf80d8a84d29289d",
  measurementId: "G-5NCKNW2SR4",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Listen for background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[Admin SW] Received background message: ", payload);

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "Системное уведомление";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
    data: { url: payload.data?.url || "/dashboard" },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Focus the admin tab if they click the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      }),
  );
});
