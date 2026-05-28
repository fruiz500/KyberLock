/**
 * Fault-Tolerant Offline Service Worker
 * Adapted for Secure Bootloader Architecture
 */

// Bump version to force cache refresh
const CACHE_NAME = 'crypto-app-cache-v1'; // Change to 'passlok-cache-v1' or 'kyberlock-cache-v1'

const OFFLINE_ASSETS = [
    './?worker_cache=true',
    'index.html?worker_cache=true',
    'site.webmanifest',
    'touch-icon.png',
    'icon-512.png',
    'favicon.png',
    'app-config.json',
    'style.css',
    'app-ui.html',
    'js-opensrc/noble-ciphers.js',
    'js-opensrc/noble-hashes.js',
    'js-opensrc/noble-post-quantum.js',
    'js-opensrc/purify.js',
    'js-opensrc/secrets.js',
    'js-opensrc/jsteg-1.0.js',
    'js-opensrc/jstegdecoder-1.0.js',
    'js-opensrc/jstegencoder-1.0.js',
    'js-opensrc/lz-string.js',
    'js-head/license.js',
    'js-head/dictionary_en.js',
    'js-head/crypto-main.js',
    'js-head/cypto-extra.js',
    'js-head/mail&chat.js',
    'js-head/SSSS.js',
    'js-head/localdir.js',
    'js-head/textstego.js',
    'js-head/prng.js',
    'js-head/plstego.js',
    'js-head/imagestego.js',
    'js-head/Chromestuff.js',
    'hashes.json',
    'manifest.sig'
];

// 1. FAULT-TOLERANT INSTALLATION
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                OFFLINE_ASSETS.map(url => {
                    return fetch(url).then(response => {
                        // If the file exists, cache it. If it 404s, skip it but DON'T crash the others!
                        if (response.ok) return cache.put(url, response);
                        console.warn('Skipped missing file:', url);
                    }).catch(err => console.warn('Network error caching:', url));
                })
            );
        }).then(() => self.skipWaiting()) // Update the worker safely
    );
});

// 2. CLEANUP OLD CACHES (Passive Activation)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((cache) => {
                if (cache !== CACHE_NAME) return caches.delete(cache);
            }));
        })
    );
});

// 3. THE "DUMMY APP" PROVEN FETCH LOGIC
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            // If we have it, serve it. If not, try the network.
            if (cachedResponse) return cachedResponse;
            return fetch(event.request);
        }).catch(() => {
            // THE FATAL CATCH: If the network fails entirely (Airplane mode)
            // and the OS is asking for a webpage, force the index file!
            if (event.request.mode === 'navigate') {
                return caches.match('index.html?worker_cache=true', { ignoreSearch: true });
            }
        })
    );
});