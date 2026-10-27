importScripts('/local-store.js');
importScripts('/recurrence.js');
const CACHE='solo-shell-v1';
// Generated at build time; development has a minimal shell without caching Vite modules.
importScripts('/precache.js');
// Fingerprinted assets are immutable: reuse local copies across releases.
// Large illustrations are cached on first use, not downloaded for every installation.
async function installShell(){const cache=await caches.open(CACHE);for(const url of self.SOLO_PRECACHE||['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png']){const cached=url.startsWith('/assets/')?await caches.match(url,{ignoreVary:true}):null;const response=cached||await fetch(new Request(url,{cache:url.startsWith('/assets/')?'default':'reload'}));if(!response.ok)throw Error('Offline shell incomplete');await cache.put(url,response)}await self.skipWaiting()}
self.addEventListener('install',event=>event.waitUntil(installShell()));
async function asset(request){const cached=await caches.match(request,{ignoreVary:true});if(cached)return cached;const response=await fetch(request);if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}return response}
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||['/sitemap.xml','/robots.txt'].includes(u.pathname)||/^\/about-(th|en)\.html$/.test(u.pathname)||u.pathname.startsWith('/src/')||u.pathname.includes('@vite')||u.pathname.includes('node_modules'))return;if(event.request.mode==='navigate'&&u.pathname.startsWith('/icons/'))return;if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('/'))||fetch(event.request)));return}if((self.SOLO_PRECACHE||[]).includes(u.pathname))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request,{ignoreVary:true}))||fetch(event.request)));else if(u.pathname.startsWith('/assets/'))event.respondWith(asset(event.request));});
async function notify(payload){const settings=await SoloStore.get('push-settings');if(!settings?.enabled)return;const today=SoloStore.day(settings.zone);if(payload.day&&payload.day!==today)return;const record=await SoloStore.claim(today,await SoloStore.get('items'));if(!record)return;try{await self.registration.showNotification(record.title,{body:record.body,icon:'/icons/icon-192.png',badge:'/icons/badge.png',tag:record.id,renotify:false,data:{url:'/?notifications=1',id:record.id}});await SoloStore.delivered(record.id,'shown')}catch(e){await SoloStore.delivered(record.id,'failed');throw e}for(const c of await self.clients.matchAll({type:'window'}))c.postMessage({type:'inbox-updated'});}
self.addEventListener('push',event=>{event.waitUntil(notify(event.data?event.data.json():{}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{await SoloStore.read(event.notification.data.id);const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of windows){if(new URL(c.url).origin===self.location.origin){await c.navigate('/?notifications=1');await c.focus();return}}await self.clients.openWindow('/?notifications=1')})())});



