/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
			}
		}

		await sw.clients.claim();
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') {
		return;
	}

	async function respond() {
		const url = new URL(event.request.url);

		if (url.origin !== sw.location.origin) {
			return fetch(event.request);
		}

		const cache = await caches.open(CACHE);

		if (ASSETS.includes(url.pathname)) {
			const cachedAsset = await cache.match(url.pathname);
			if (cachedAsset) {
				return cachedAsset;
			}
		}

		try {
			const response = await fetch(event.request);

			if (response instanceof Response && response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (error) {
			const cached = await cache.match(event.request);
			if (cached) {
				return cached;
			}

			throw error;
		}
	}

	event.respondWith(respond());
});