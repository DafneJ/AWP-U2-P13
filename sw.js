const STATIC_CACHE_NAME = 'static-cache-v1.4';
const INMUTABLE_CACHE_NAME = 'inmutable-cache-v1.1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1.1';
const ROOT_PATH = "/AWP-U2-P13";

const cleanCache = (cacheName, limitItems) => {
    caches.open(cacheName).then((cache) => {
        return cache.keys().then((keys) => {
            if (keys.length > limitItems) {
                cache.delete(keys[0]).then(cleanCache(cacheName, limitItems));
            }
        });
    });
};

self.addEventListener('install', (event) => {
    const respCache = caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll([
            `${ROOT_PATH}/`, 
            `${ROOT_PATH}/index.html`,
            `${ROOT_PATH}/manifest.json`,
            `${ROOT_PATH}/js/app.js`,
           `${ROOT_PATH}/js/base.js`,
           `${ROOT_PATH}/js/pouchdb-nightly.js`,
            `${ROOT_PATH}/style/base.css`,
            `${ROOT_PATH}/style/bg.png`,
            `${ROOT_PATH}/style/plain_sign_in_blue.png`,
        ]);
    });
    const respCacheInmutable = caches.open(INMUTABLE_CACHE_NAME).then((cache) => {
        return cache.addAll([
            // New url
            "https://cdn.jsdelivr.net/npm/pouchdb@7.3.1/dist/pouchdb.min.js",
           
        ]);
    });

    event.waitUntil(Promise.all([respCache, respCacheInmutable]));
});

self.addEventListener('activate', (event) => {
    console.log("Activado");
    const proDelete = caches.keys().then((cachesItems) => {
        cachesItems.forEach(element => {
            if (element !== STATIC_CACHE_NAME && element.includes('static')) {
               return caches.delete(element)
            }
        })
    })
//event.waitUntil(proDelete)
event.waitUntil(Promise.all([proDelete]))
})

// self.addEventListener('fetch',(event)=>{
//     const resp = caches.match(event.request)
//     event.respondWith(resp)
// })

self.addEventListener('fetch', (event) => {
    const resp = caches.match(event.request).then((respCache) => {
        if (respCache) {
            return respCache;
        }
        return fetch(event.request).then((respWeb) => {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, respWeb);
                cleanCache(DYNAMIC_CACHE_NAME, 10);
            });
            return respWeb.clone();
        });

    }).catch((err) => {
        if (event.request.headers.get('accept').includes('image/*')) {
          
           return caches.match('/AWP-U2-P13/style/plain_sign_in_blue.png')
        }
        if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/AWP-U2-P13/index.html')
           
         }
        
    })
    event.respondWith(resp);
});
