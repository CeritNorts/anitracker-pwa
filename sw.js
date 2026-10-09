const CACHE_NAME = 'anitracker-v4';

// Todos los assets e iconos registrados
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons/Attack on Titan.png',
    './icons/Chuunibyou.png',
    './icons/DanMachi.png',
    './icons/DateALive.png',
    './icons/FairyTail.png',
    './icons/Free!.png',
    './icons/Infinite Stratos.png',
    './icons/Konosuba.png',
    './icons/LCL.png',
    './icons/Monachina.png',
    './icons/Monachina2.png',
    './icons/MyHero Academia.png',
    './icons/No Game No Life.png',
    './icons/School Days.png',
    './icons/Sword Art Online.png'
];

// Instalación: Guardar recursos en caché
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Guardando los archivos e iconos en caché...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activación: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Borrando caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Estrategia Cache First
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Listener para recibir Notificaciones Push reales del servidor Node.js
self.addEventListener('push', (event) => {
    let data = { title: '⛩️ AniTracker', body: '¡Nuevo contenido disponible!' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'icons/Sword Art Online.png',
        badge: 'icons/Attack on Titan.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});