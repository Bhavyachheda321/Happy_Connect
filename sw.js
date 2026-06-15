const CACHE='pcv7-v1';
const ASSETS=['/Happy_Connect/','/Happy_Connect/index.html'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const rc=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,rc));
      return r;
    }).catch(()=>caches.match(e.request))
  );
});

self.addEventListener('push',e=>{
  const data=e.data?e.data.json():{title:'Private Chat',body:'New message'};
  e.waitUntil(
    self.registration.showNotification(data.title||'Private Chat',{
      body:data.body||'You have a new message',
      icon:data.icon||'/Happy_Connect/icon.png',
      badge:data.badge||'/Happy_Connect/icon.png',
      tag:data.tag||'pchat',
      renotify:true,
      data:{url:data.url||'/Happy_Connect/'}
    })
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(cls=>{
      for(const c of cls){if(c.url.includes('Happy_Connect')&&'focus'in c)return c.focus();}
      if(clients.openWindow)return clients.openWindow(e.notification.data?.url||'/Happy_Connect/');
    })
  );
});
