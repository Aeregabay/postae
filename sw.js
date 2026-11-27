const V='postae-v1795764618',SHELL=['./','index.html','manifest.webmanifest','icon.svg','parser.js','icons.js','icon-svgs.js','vendor/jsbarcode.min.js','vendor/qrcode.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const html=r.mode==='navigate'||u.pathname.endsWith('.html');
  if(html){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ca=>ca.put(r,c));return x}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
  if(u.origin===location.origin||u.host==='esm.sh'){
    e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(ca=>ca.put(r,c))}return x}).catch(()=>m);return m||n}));
  }
});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Postä',{body:d.body||'',tag:d.tag,icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL(e.notification.data?.url||'./',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{const c=l.find(x=>x.url.startsWith(self.registration.scope));return c?c.focus():clients.openWindow(url)}))});
