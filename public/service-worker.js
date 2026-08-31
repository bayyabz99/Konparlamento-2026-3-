// Service Worker with PWA Caching & Firebase Cloud Messaging (FCM) Integration
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker
const firebaseConfig = {
  apiKey: "AIzaSyDummyApiKeyForKonparlamento2026",
  authDomain: "konparlamento-2026.firebaseapp.com",
  projectId: "konparlamento-2026",
  storageBucket: "konparlamento-2026.appspot.com",
  messagingSenderId: "103948572019",
  appId: "1:103948572019:web:9876543210fedcba"
};

if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

if (typeof firebase !== 'undefined' && firebase.messaging) {
  try {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      console.log('[service-worker.js] Received background message: ', payload);
      const notificationTitle = payload.notification?.title || payload.data?.title || 'Konparlamento 2026 Duyurusu';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Yeni bir bildiriminiz var.',
        icon: '/konparlamento-logo.png',
        badge: '/konparlamento-logo.png',
        data: payload.data || { url: '/' },
        vibrate: [200, 100, 200]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.warn('[service-worker.js] FCM Messaging init warning: ', err);
  }
}

// Service Worker Cache Name
const CACHE_NAME = 'konparlamento-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/konparlamento-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push Notification Listener (Fallback & Direct Web Push)
self.addEventListener('push', (event) => {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Konparlamento 2026', body: event.data.text() };
    }
    const title = data.title || data.notification?.title || 'Konparlamento 2026 Duyurusu';
    const options = {
      body: data.body || data.notification?.body || 'Yeni bir bildiriminiz var.',
      icon: '/konparlamento-logo.png',
      badge: '/konparlamento-logo.png',
      data: data.data || { url: '/' },
      vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
