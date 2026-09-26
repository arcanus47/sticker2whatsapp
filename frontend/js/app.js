/* =========================================================
   STICKER2WHATSAPP
   Telegram → WhatsApp
   App JavaScript
========================================================= */

/* =========================================================
   ELEMENTOS DEL DOM
========================================================= */

const selectTelegramFolderButton =
    document.getElementById("selectTelegramFolderButton");

const telegramFolderInfo =
    document.getElementById("telegramFolderInfo");

const telegramFolderName =
    document.getElementById("telegramFolderName");

const telegramStickersContainer =
    document.getElementById("telegramStickersContainer");

const telegramStickerCount =
    document.getElementById("telegramStickerCount");

const telegramStickerGrid =
    document.getElementById("telegramStickerGrid");

const selectAllButton =
    document.getElementById("selectAllButton");

const telegramSelectionInfo =
    document.getElementById("telegramSelectionInfo");

const telegramSelectedCount =
    document.getElementById("telegramSelectedCount");

const clearTelegramSelectionButton =
    document.getElementById("clearTelegramSelectionButton");

const continueToDestinationButton =
    document.getElementById("continueToDestinationButton");

const destinationContainer =
    document.getElementById("destinationContainer");

const selectDestinationButton =
    document.getElementById("selectDestinationButton");

const destinationInfo =
    document.getElementById("destinationInfo");

const destinationFolderName =
    document.getElementById("destinationFolderName");

const convertButton =
    document.getElementById("convertButton");

const resultContainer =
    document.getElementById("resultContainer");

const resultSummary =
    document.getElementById("resultSummary");

const downloadButton =
    document.getElementById("downloadButton");

const newStickerButton =
    document.getElementById("newStickerButton");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const errorMessage =
    errorBox
        ? errorBox.querySelector("span")
        : null;


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const API_URL =
    "http://localhost:5100/api/convert";

const MAX_FILES =
    50;

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif"
];


/* =========================================================
   COMPATIBILIDAD
========================================================= */

const FILE_SYSTEM_ACCESS_SUPPORTED =
    "showDirectoryPicker" in window;


/* =========================================================
   ESTADO DE LA APLICACIÓN
========================================================= */

let telegramFolderHandle =
    null;

let destinationFolderHandle =
    null;

let telegramFiles =
    [];

let selectedTelegramFiles =
    [];

let previewUrls =
    [];

let downloadUrl =
    null;


/* =========================================================
   INICIALIZACIÓN
========================================================= */

initializeApp();


function initializeApp() {

    console.log(
        "Sticker2WhatsApp iniciado."
    );


    console.log(
        "File System Access API:",
        FILE_SYSTEM_ACCESS_SUPPORTED
            ? "Disponible"
            : "No disponible"
    );


    if (
        !selectTelegramFolderButton
    ) {

        console.error(
            "No existe el botón #selectTelegramFolderButton."
        );

        return;

    }


    if (
        !FILE_SYSTEM_ACCESS_SUPPORTED
    ) {

        selectTelegramFolderButton.title =
            "Tu navegador no soporta selección de carpetas.";

    }


    updateSelectionInterface();

}


/* =========================================================
   SELECCIONAR CARPETA DE TELEGRAM
========================================================= */

selectTelegramFolderButton.addEventListener(
    "click",
    async () => {

        hideError();


        if (
            !FILE_SYSTEM_ACCESS_SUPPORTED
        ) {

            showError(
                "Tu navegador no permite seleccionar carpetas directamente. Utiliza Google Chrome o Microsoft Edge."
            );

            return;

        }


        try {

            telegramFolderHandle =
                await window.showDirectoryPicker({
                    mode: "read"
                });


            console.log(
                "Carpeta seleccionada:",
                telegramFolderHandle.name
            );


            telegramFolderName.textContent =
                telegramFolderHandle.name;


            telegramFolderInfo.classList.remove(
                "hidden"
            );


            await scanTelegramFolder();


        } catch (error) {

            console.error(
                "Error seleccionando carpeta:",
                error
            );


            if (
                error.name === "AbortError"
            ) {

                return;

            }


            showError(
                "No se pudo acceder a la carpeta seleccionada."
            );

        }

    }
);


/* =========================================================
   ESCANEAR CARPETA DE TELEGRAM
========================================================= */

async function scanTelegramFolder() {

    clearTelegramFiles();


    telegramStickerGrid.innerHTML =
        "";


    telegramStickerCount.textContent =
        "0";


    telegramStickersContainer.classList.add(
        "hidden"
    );


    try {

        console.log(
            "Buscando stickers recursivamente..."
        );


        await scanDirectoryRecursive(
            telegramFolderHandle
        );


        /*
         * Ordenar por nombre para que
         * el resultado sea predecible.
         */

        telegramFiles.sort(
            (a, b) =>
                a.relativePath.localeCompare(
                    b.relativePath,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
        );


        /*
         * Limitar cantidad máxima.
         */

        let exceededLimit =
            false;


        if (
            telegramFiles.length >
            MAX_FILES
        ) {

            telegramFiles =
                telegramFiles.slice(
                    0,
                    MAX_FILES
                );

            exceededLimit =
                true;

        }


        telegramStickerCount.textContent =
            telegramFiles.length;


        console.log(
            "Stickers encontrados:",
            telegramFiles.length
        );


        telegramStickersContainer.classList.remove(
            "hidden"
        );


        if (
            telegramFiles.length ===
            0
        ) {

            showNoStickersMessage();

            return;

        }


        renderTelegramStickers();


        if (
            exceededLimit
        ) {

            showError(
                `Se encontraron más de ${MAX_FILES} archivos compatibles. Solo se muestran los primeros ${MAX_FILES}.`
            );

        }

    } catch (error) {

        console.error(
            "Error leyendo carpeta:",
            error
        );


        showError(
            "No se pudo leer la carpeta de Telegram."
        );

    }

}


/* =========================================================
   ESCANEO RECURSIVO
========================================================= */

async function scanDirectoryRecursive(
    directoryHandle,
    currentPath = ""
) {

    for await (
        const entry
        of directoryHandle.values()
    ) {

        /*
         * Ignorar entradas que no sean
         * archivos o carpetas.
         */

        if (
            entry.kind !== "file" &&
            entry.kind !== "directory"
        ) {

            continue;

        }


        /*
         * Si es una carpeta,
         * entrar recursivamente.
         */

        if (
            entry.kind === "directory"
        ) {

            const nextPath =
                currentPath
                    ? `${currentPath}/${entry.name}`
                    : entry.name;


            await scanDirectoryRecursive(
                entry,
                nextPath
            );


            /*
             * Si ya alcanzamos el límite,
             * podemos detener el recorrido.
             */

            if (
                telegramFiles.length >=
                MAX_FILES
            ) {

                return;

            }


            continue;

        }


        /*
         * Obtener extensión.
         */

        const extension =
            getFileExtension(
                entry.name
            );


        /*
         * Ignorar formatos incompatibles.
         */

        if (
            !ALLOWED_EXTENSIONS.includes(
                extension
            )
        ) {

            continue;

        }


        try {

            const file =
                await entry.getFile();


            /*
             * Ignorar archivos demasiado grandes.
             */

            if (
                file.size >
                MAX_FILE_SIZE
            ) {

                console.warn(
                    "Archivo demasiado grande:",
                    file.name
                );

                continue;

            }


            telegramFiles.push({

                file: file,

                handle: entry,

                name: file.name,

                relativePath:
                    currentPath
                        ? `${currentPath}/${file.name}`
                        : file.name

            });


            /*
             * Detener cuando superamos
             * el máximo.
             */

            if (
                telegramFiles.length >
                MAX_FILES
            ) {

                return;

            }

        } catch (fileError) {

            console.warn(
                "No se pudo leer:",
                entry.name,
                fileError
            );

        }

    }

}


/* =========================================================
   MENSAJE SIN STICKERS
========================================================= */

function showNoStickersMessage() {

    telegramStickerGrid.innerHTML = `

        <div
            class="text-center py-4"
            style="grid-column: 1 / -1;"
        >

            <i
                class="bi bi-images"
                style="
                    font-size: 40px;
                    color: #89959c;
                "
            ></i>

            <p
                class="mt-3 mb-1"
                style="
                    font-weight: 700;
                    color: #111b21;
                "
            >
                No encontramos stickers
            </p>

            <small
                style="
                    color: #667781;
                "
            >
                La carpeta seleccionada no contiene
                imágenes compatibles.
            </small>

        </div>

    `;

}


/* =========================================================
   MOSTRAR STICKERS
========================================================= */

function renderTelegramStickers() {

    clearPreviewUrls();


    telegramStickerGrid.innerHTML =
        "";


    telegramFiles.forEach(
        (sticker, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "telegram-sticker-item";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "telegram-sticker-card";


            const image =
                document.createElement(
                    "img"
                );


            const imageUrl =
                URL.createObjectURL(
                    sticker.file
                );


            previewUrls.push(
                imageUrl
            );


            image.src =
                imageUrl;


            image.alt =
                `Sticker ${index + 1}`;


            image.loading =
                "lazy";


            const check =
                document.createElement(
                    "span"
                );


            check.className =
                "telegram-sticker-check";


            check.innerHTML =
                '<i class="bi bi-check-lg"></i>';


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "telegram-sticker-name";


            name.textContent =
                sticker.name;


            name.title =
                sticker.relativePath;


            card.appendChild(
                image
            );


            card.appendChild(
                check
            );


            item.appendChild(
                card
            );


            item.appendChild(
                name
            );


            telegramStickerGrid.appendChild(
                item
            );


            if (
                selectedTelegramFiles.includes(
                    sticker
                )
            ) {

                card.classList.add(
                    "selected"
                );

            }


            item.addEventListener(
                "click",
                () => {

                    toggleTelegramSticker(
                        sticker,
                        card
                    );

                }
            );

        }
    );


    updateSelectionInterface();

}


/* =========================================================
   SELECCIONAR / DESELECCIONAR
========================================================= */

function toggleTelegramSticker(
    sticker,
    card
) {

    hideError();


    const index =
        selectedTelegramFiles.indexOf(
            sticker
        );


    if (
        index === -1
    ) {

        if (
            selectedTelegramFiles.length >=
            MAX_FILES
        ) {

            showError(
                `Puedes seleccionar un máximo de ${MAX_FILES} stickers.`
            );

            return;

        }


        selectedTelegramFiles.push(
            sticker
        );


        card.classList.add(
            "selected"
        );


    } else {

        selectedTelegramFiles.splice(
            index,
            1
        );


        card.classList.remove(
            "selected"
        );

    }


    updateSelectionInterface();

}


/* =========================================================
   SELECCIONAR TODOS
========================================================= */

selectAllButton.addEventListener(
    "click",
    () => {

        hideError();


        if (
            telegramFiles.length ===
            0
        ) {

            return;

        }


        if (
            selectedTelegramFiles.length ===
            telegramFiles.length
        ) {

            selectedTelegramFiles =
                [];


        } else {

            selectedTelegramFiles =
                telegramFiles.slice(
                    0,
                    MAX_FILES
                );

        }


        updateStickerCardStates();

        updateSelectionInterface();

    }
);


/* =========================================================
   ACTUALIZAR TARJETAS
========================================================= */

function updateStickerCardStates() {

    const cards =
        telegramStickerGrid.querySelectorAll(
            ".telegram-sticker-card"
        );


    cards.forEach(
        (card, index) => {

            const sticker =
                telegramFiles[index];


            if (
                selectedTelegramFiles.includes(
                    sticker
                )
            ) {

                card.classList.add(
                    "selected"
                );

            } else {

                card.classList.remove(
                    "selected"
                );

            }

        }
    );

}


/* =========================================================
   ACTUALIZAR INTERFAZ
========================================================= */

function updateSelectionInterface() {

    const count =
        selectedTelegramFiles.length;


    telegramSelectedCount.textContent =
        count;


    if (
        count > 0
    ) {

        telegramSelectionInfo.classList.remove(
            "hidden"
        );

    } else {

        telegramSelectionInfo.classList.add(
            "hidden"
        );

    }


    continueToDestinationButton.disabled =
        count === 0;


    if (
        count === 1
    ) {

        continueToDestinationButton.innerHTML = `

            <i class="bi bi-arrow-right"></i>

            Continuar con 1 sticker

        `;

    } else if (
        count > 1
    ) {

        continueToDestinationButton.innerHTML = `

            <i class="bi bi-arrow-right"></i>

            Continuar con ${count} stickers

        `;

    } else {

        continueToDestinationButton.innerHTML = `

            <i class="bi bi-arrow-right"></i>

            Continuar

        `;

    }


    if (
        telegramFiles.length > 0 &&
        selectedTelegramFiles.length ===
        telegramFiles.length
    ) {

        selectAllButton.innerHTML = `

            <i class="bi bi-x-square"></i>

            Quitar todos

        `;

    } else {

        selectAllButton.innerHTML = `

            <i class="bi bi-check2-square"></i>

            Seleccionar todos

        `;

    }

}


/* =========================================================
   LIMPIAR SELECCIÓN
========================================================= */

clearTelegramSelectionButton.addEventListener(
    "click",
    () => {

        selectedTelegramFiles =
            [];


        updateStickerCardStates();

        updateSelectionInterface();

        hideError();

    }
);


/* =========================================================
   CONTINUAR
========================================================= */

continueToDestinationButton.addEventListener(
    "click",
    () => {

        if (
            selectedTelegramFiles.length ===
            0
        ) {

            showError(
                "Primero selecciona al menos un sticker."
            );

            return;

        }


        destinationContainer.classList.remove(
            "hidden"
        );


        destinationContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


/* =========================================================
   SELECCIONAR CARPETA DE DESTINO
========================================================= */

selectDestinationButton.addEventListener(
    "click",
    async () => {

        hideError();


        if (
            !FILE_SYSTEM_ACCESS_SUPPORTED
        ) {

            showError(
                "Tu navegador no permite seleccionar carpetas directamente. Utiliza Google Chrome o Microsoft Edge."
            );

            return;

        }


        try {

            destinationFolderHandle =
                await window.showDirectoryPicker({
                    mode: "readwrite"
                });


            console.log(
                "Carpeta destino:",
                destinationFolderHandle.name
            );


            destinationFolderName.textContent =
                destinationFolderHandle.name;


            destinationInfo.classList.remove(
                "hidden"
            );


            convertButton.disabled =
                false;


            const count =
                selectedTelegramFiles.length;


            convertButton.innerHTML = `

                <i class="bi bi-magic"></i>

                Convertir y guardar
                ${count}
                ${count === 1 ? "sticker" : "stickers"}

            `;


        } catch (error) {

            console.error(
                "Error seleccionando destino:",
                error
            );


            if (
                error.name === "AbortError"
            ) {

                return;

            }


            showError(
                "No se pudo seleccionar la carpeta de destino."
            );

        }

    }
);


/* =========================================================
   CONVERTIR Y GUARDAR
========================================================= */

convertButton.addEventListener(
    "click",
    async () => {

        if (
            selectedTelegramFiles.length ===
            0
        ) {

            showError(
                "Primero selecciona al menos un sticker."
            );

            return;

        }


        if (
            !destinationFolderHandle
        ) {

            showError(
                "Primero selecciona una carpeta de destino."
            );

            return;

        }


        hideError();


        loading.classList.remove(
            "hidden"
        );


        destinationContainer.classList.add(
            "hidden"
        );


        resultContainer.classList.add(
            "hidden"
        );


        convertButton.disabled =
            true;


        const total =
            selectedTelegramFiles.length;


        let successful =
            0;


        try {

            for (
                let i = 0;
                i < total;
                i++
            ) {

                await convertAndSaveSingle(
                    selectedTelegramFiles[i],
                    i + 1,
                    total
                );


                successful++;

            }


            showSuccess(
                total === 1
                    ? "1 sticker convertido y guardado correctamente."
                    : `${successful} stickers convertidos y guardados correctamente.`
            );


        } catch (error) {

            console.error(
                "Error durante conversión:",
                error
            );


            destinationContainer.classList.remove(
                "hidden"
            );


            showError(
                error.message ||
                "Ocurrió un error al convertir los stickers."
            );


        } finally {

            loading.classList.add(
                "hidden"
            );


            convertButton.disabled =
                false;

        }

    }
);


/* =========================================================
   CONVERTIR Y GUARDAR UN STICKER
========================================================= */

async function convertAndSaveSingle(
    sticker,
    current,
    total
) {

    const loadingTitle =
        loading.querySelector("h3");


    const loadingText =
        loading.querySelector("p");


    if (
        loadingTitle
    ) {

        loadingTitle.textContent =
            `Procesando sticker ${current} de ${total}...`;

    }


    if (
        loadingText
    ) {

        loadingText.textContent =
            `Convirtiendo "${sticker.name}" a WebP...`;

    }


    const formData =
        new FormData();


    formData.append(
        "stickers",
        sticker.file,
        sticker.name
    );


    let response;


    try {

        response =
            await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

    } catch (networkError) {

        throw new Error(
            "No se pudo conectar con el servidor de conversión. Verifica que el backend esté funcionando."
        );

    }


    if (
        !response.ok
    ) {

        let message =
            `No se pudo convertir "${sticker.name}".`;


        try {

            const data =
                await response.json();


            if (
                data.error
            ) {

                message =
                    data.error;

            }

        } catch {

            /*
             * La respuesta no era JSON.
             */

        }


        throw new Error(
            message
        );

    }


    const blob =
        await response.blob();


    if (
        !blob ||
        blob.size === 0
    ) {

        throw new Error(
            `El servidor no devolvió un archivo válido para "${sticker.name}".`
        );

    }


    /*
     * Crear nombre de salida.
     */

    const outputName =
        await createUniqueOutputFilename(
            sticker.name
        );


    /*
     * Crear archivo.
     */

    const fileHandle =
        await destinationFolderHandle.getFileHandle(
            outputName,
            {
                create: true
            }
        );


    /*
     * Escribir archivo.
     */

    const writable =
        await fileHandle.createWritable();


    try {

        await writable.write(
            blob
        );

    } finally {

        await writable.close();

    }


    console.log(
        `Guardado: ${outputName}`
    );

}


/* =========================================================
   CREAR NOMBRE DE SALIDA ÚNICO
========================================================= */

async function createUniqueOutputFilename(
    originalName
) {

    const baseName =
        originalName
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[<>:"/\\|?*]/g,
                "_"
            )
            .trim();


    const safeBaseName =
        baseName ||
        "sticker";


    let filename =
        `${safeBaseName}.webp`;


    let counter =
        1;


    /*
     * Comprobar si ya existe.
     *
     * Si existe:
     * sticker.webp
     * sticker (1).webp
     * sticker (2).webp
     * etc.
     */

    while (
        await fileExists(
            destinationFolderHandle,
            filename
        )
    ) {

        filename =
            `${safeBaseName} (${counter}).webp`;

        counter++;

    }


    return filename;

}


/* =========================================================
   COMPROBAR SI EXISTE UN ARCHIVO
========================================================= */

async function fileExists(
    directoryHandle,
    filename
) {

    try {

        await directoryHandle.getFileHandle(
            filename,
            {
                create: false
            }
        );


        return true;

    } catch (error) {

        if (
            error.name ===
            "NotFoundError"
        ) {

            return false;

        }


        throw error;

    }

}


/* =========================================================
   CREAR NOMBRE DE SALIDA
========================================================= */

function createOutputFilename(
    originalName
) {

    const baseName =
        originalName.replace(
            /\.[^/.]+$/,
            ""
        );


    const safeName =
        baseName
            .replace(
                /[<>:"/\\|?*]/g,
                "_"
            )
            .trim();


    if (
        !safeName
    ) {

        return "sticker.webp";

    }


    return `${safeName}.webp`;

}


/* =========================================================
   MOSTRAR RESULTADO
========================================================= */

function showSuccess(
    message
) {

    if (
        resultSummary
    ) {

        resultSummary.innerHTML = `

            <i class="bi bi-check-circle"></i>

            <span>
                ${escapeHtml(message)}
            </span>

        `;

    }


    resultContainer.classList.remove(
        "hidden"
    );


    resultContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   BOTÓN DE DESCARGA
========================================================= */

downloadButton.addEventListener(
    "click",
    (event) => {

        if (
            !downloadUrl
        ) {

            event.preventDefault();


            showError(
                "Los stickers ya fueron guardados directamente en la carpeta que seleccionaste."
            );

        }

    }
);


/* =========================================================
   NUEVA CONVERSIÓN
========================================================= */

newStickerButton.addEventListener(
    "click",
    () => {

        resetApplication();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   RESET
========================================================= */

function resetApplication() {

    telegramFolderHandle =
        null;


    destinationFolderHandle =
        null;


    telegramFiles =
        [];


    selectedTelegramFiles =
        [];


    clearPreviewUrls();


    if (
        downloadUrl
    ) {

        URL.revokeObjectURL(
            downloadUrl
        );


        downloadUrl =
            null;

    }


    telegramStickerGrid.innerHTML =
        "";


    telegramStickerCount.textContent =
        "0";


    telegramSelectedCount.textContent =
        "0";


    telegramFolderName.textContent =
        "Carpeta no seleccionada";


    destinationFolderName.textContent =
        "Carpeta no seleccionada";


    telegramFolderInfo.classList.add(
        "hidden"
    );


    destinationInfo.classList.add(
        "hidden"
    );


    telegramStickersContainer.classList.add(
        "hidden"
    );


    telegramSelectionInfo.classList.add(
        "hidden"
    );


    destinationContainer.classList.add(
        "hidden"
    );


    resultContainer.classList.add(
        "hidden"
    );


    loading.classList.add(
        "hidden"
    );


    convertButton.disabled =
        true;


    continueToDestinationButton.disabled =
        true;


    continueToDestinationButton.innerHTML = `

        <i class="bi bi-arrow-right"></i>

        Continuar

    `;


    convertButton.innerHTML = `

        <i class="bi bi-magic"></i>

        Convertir y guardar stickers

    `;


    hideError();

}


/* =========================================================
   LIMPIAR ARCHIVOS DE TELEGRAM
========================================================= */

function clearTelegramFiles() {

    telegramFiles =
        [];


    selectedTelegramFiles =
        [];


    clearPreviewUrls();


    updateSelectionInterface();

}


/* =========================================================
   OBTENER EXTENSIÓN
========================================================= */

function getFileExtension(
    filename
) {

    const lastDot =
        filename.lastIndexOf(".");


    if (
        lastDot === -1
    ) {

        return "";

    }


    return filename
        .substring(lastDot)
        .toLowerCase();

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   MOSTRAR ERROR
========================================================= */

function showError(
    message
) {

    if (
        !errorBox
    ) {

        console.error(
            message
        );

        return;

    }


    if (
        errorMessage
    ) {

        errorMessage.textContent =
            message;

    } else {

        errorBox.textContent =
            message;

    }


    errorBox.classList.remove(
        "hidden"
    );

}


/* =========================================================
   OCULTAR ERROR
========================================================= */

function hideError() {

    if (
        !errorBox
    ) {

        return;

    }


    errorBox.classList.add(
        "hidden"
    );


    if (
        errorMessage
    ) {

        errorMessage.textContent =
            "";

    }

}


/* =========================================================
   LIMPIAR URLS
========================================================= */

function clearPreviewUrls() {

    previewUrls.forEach(
        (url) => {

            URL.revokeObjectURL(
                url
            );

        }
    );


    previewUrls =
        [];

}


/* =========================================================
   SERVICE WORKER
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./sw.js"
                )
                .then(
                    (registration) => {

                        console.log(
                            "Sticker2WhatsApp: Service Worker registrado correctamente.",
                            registration
                        );

                    }
                )
                .catch(
                    (error) => {

                        console.error(
                            "Sticker2WhatsApp: Error registrando Service Worker:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   LIMPIEZA AL SALIR
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearPreviewUrls();


        if (
            downloadUrl
        ) {

            URL.revokeObjectURL(
                downloadUrl
            );

        }

    }
);
