/* =========================================================
   STICKER2WHATSAPP
   Service Worker
========================================================= */

const CACHE_NAME = "sticker2whatsapp-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/app.js"
];


/* =========================================================
   INSTALACIÓN
========================================================= */

self.addEventListener(
    "install",
    (event) => {

        console.log(
            "Sticker2WhatsApp: Service Worker instalado."
        );

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    (cache) => {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );

        self.skipWaiting();

    }
);


/* =========================================================
   ACTIVACIÓN
========================================================= */

self.addEventListener(
    "activate",
    (event) => {

        console.log(
            "Sticker2WhatsApp: Service Worker activado."
        );

        event.waitUntil(

            caches
                .keys()
                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    (cacheName) => {

                                        return (
                                            cacheName !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    (cacheName) => {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }
                                )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


/* =========================================================
   INTERCEPTAR PETICIONES
========================================================= */

self.addEventListener(
    "fetch",
    (event) => {

        /*
         * Solo manejamos peticiones GET.
         *
         * Las peticiones POST hacia el backend
         * NO se modifican.
         */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    (cachedResponse) => {

                        /*
                         * Si existe en caché,
                         * utilizarlo.
                         */

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        /*
                         * Si no existe,
                         * solicitarlo a Internet.
                         */

                        return fetch(
                            event.request
                        )
                            .then(
                                (networkResponse) => {

                                    /*
                                     * Guardar una copia
                                     * solamente de respuestas
                                     * válidas.
                                     */

                                    if (
                                        networkResponse &&
                                        networkResponse.status === 200 &&
                                        networkResponse.type ===
                                            "basic"
                                    ) {

                                        const responseClone =
                                            networkResponse.clone();


                                        caches
                                            .open(
                                                CACHE_NAME
                                            )
                                            .then(
                                                (cache) => {

                                                    cache.put(
                                                        event.request,
                                                        responseClone
                                                    );

                                                }
                                            );

                                    }


                                    return networkResponse;

                                }
                            )
                            .catch(
                                () => {

                                    /*
                                     * Si no hay Internet,
                                     * intentar cargar la página
                                     * principal desde caché.
                                     */

                                    return caches.match(
                                        "./index.html"
                                    );

                                }
                            );

                    }
                )

        );

    }
);
