# Sticker2WhatsApp

Aplicación web progresiva (PWA) para convertir stickers de **Telegram** a formato compatible con **WhatsApp**.

El proyecto está diseñado como un MVP sencillo, rápido y enfocado en dispositivos móviles, aunque actualmente la selección directa de carpetas funciona principalmente en navegadores de escritorio basados en Chromium.

---

## 📌 Características

* Convertir stickers de Telegram a WebP.
* Seleccionar directamente una carpeta desde el navegador.
* Buscar imágenes de stickers dentro de carpetas y subcarpetas.
* Vista previa de los stickers encontrados.
* Selección individual de stickers.
* Seleccionar todos los stickers.
* Quitar toda la selección.
* Seleccionar una carpeta de destino.
* Guardar los stickers convertidos directamente en la carpeta seleccionada.
* Límite de hasta 50 stickers por conversión.
* Límite de 10 MB por archivo.
* Soporte para:

  * PNG
  * JPG
  * JPEG
  * WEBP
  * GIF
* Conversión automática a WebP.
* Redimensionamiento máximo de 512 × 512 píxeles.
* PWA instalable.
* Service Worker para caché básica y funcionamiento más rápido.
* Backend independiente desarrollado con Flask.
* Frontend independiente desarrollado con HTML5, CSS3 y JavaScript.

---

# 🏗️ Arquitectura del proyecto

El proyecto está dividido en dos partes:

```text
Sticker2WhatsApp
│
├── frontend/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── app.js
│   │
│   └── assets/
│       ├── icon-192.png
│       └── icon-512.png
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   └── convert.py
│   │
│   ├── services/
│   │   └── sticker_converter.py
│   │
│   └── temp/
│
└── README.md
```

---

# 🖥️ Frontend

El frontend es la interfaz que utiliza el usuario.

Tecnologías:

* HTML5
* CSS3
* JavaScript
* Bootstrap
* Bootstrap Icons
* PWA
* File System Access API

## Archivos principales

### `index.html`

Contiene la interfaz principal de Sticker2WhatsApp.

Incluye:

* Selección de carpeta de Telegram.
* Galería de stickers.
* Selección de stickers.
* Selección de carpeta de destino.
* Conversión.
* Mensajes de éxito y error.

---

### `css/style.css`

Contiene todos los estilos visuales de la aplicación.

Incluye:

* Diseño responsive.
* Diseño mobile-first.
* Tarjetas de stickers.
* Galería.
* Botones.
* Estados seleccionados.
* Loading.
* Mensajes de error.
* Resultado de conversión.

---

### `js/app.js`

Controla la lógica del frontend.

Funciones principales:

* Selección de carpeta de Telegram.
* Lectura de archivos.
* Búsqueda de stickers.
* Lectura de subcarpetas.
* Vista previa.
* Selección individual.
* Seleccionar todos.
* Deseleccionar todos.
* Selección de carpeta de destino.
* Comunicación con la API Flask.
* Guardado de archivos WebP.
* Registro del Service Worker.

---

### `manifest.json`

Contiene la configuración necesaria para instalar Sticker2WhatsApp como aplicación PWA.

Incluye:

* Nombre.
* Nombre corto.
* Descripción.
* Color del tema.
* Orientación.
* Iconos.
* Configuración de instalación.

---

### `sw.js`

Service Worker de la aplicación.

Se utiliza para:

* Crear caché de archivos principales.
* Cargar recursos almacenados en caché.
* Mejorar la velocidad de carga.
* Permitir funcionamiento básico sin conexión para los recursos estáticos.

Las operaciones de conversión requieren comunicación con el backend.

---

# ⚙️ Backend

El backend está desarrollado con Python y Flask.

Tecnologías:

* Python 3
* Flask
* Flask-CORS
* Pillow

---

## `app.py`

Es el punto de entrada del backend.

Responsabilidades:

* Crear la aplicación Flask.
* Configurar CORS.
* Crear la carpeta temporal.
* Registrar las rutas.
* Iniciar el servidor.

Servidor local:

```text
http://localhost:5000
```

---

## `routes/convert.py`

Contiene la ruta:

```text
POST /api/convert
```

Esta ruta recibe los stickers enviados por el frontend y solicita su conversión al servicio correspondiente.

También controla:

* Cantidad máxima de archivos.
* Archivos temporales.
* Creación del ZIP cuando se reciben varios archivos.
* Respuestas de error.
* Limpieza de archivos temporales.

---

## `services/sticker_converter.py`

Contiene la lógica encargada de convertir las imágenes.

Proceso:

```text
Imagen original
      ↓
Validación
      ↓
Comprobación de tamaño
      ↓
Comprobación de extensión
      ↓
Verificación de imagen
      ↓
Conversión a RGBA
      ↓
Redimensionamiento
      ↓
Conversión a WebP
      ↓
Archivo final
```

---

# 📦 Formatos compatibles

Actualmente se aceptan:

```text
.png
.jpg
.jpeg
.webp
.gif
```

Los archivos se convierten a:

```text
.webp
```

---

# 📐 Límites actuales

## Cantidad

Máximo:

```text
50 stickers
```

## Tamaño

Máximo:

```text
10 MB por archivo
```

## Dimensiones

Los stickers se redimensionan para que no superen:

```text
512 × 512 píxeles
```

La proporción original de la imagen se conserva.

---

# 🐍 Instalación del backend

## 1. Entrar al backend

En PowerShell:

```powershell
cd $HOME\Documents\sticker2whatsapp\backend
```

---

## 2. Crear entorno virtual

Si todavía no existe:

```powershell
python -m venv venv
```

---

## 3. Activar entorno virtual

```powershell
.\venv\Scripts\Activate.ps1
```

Deberías ver algo similar a:

```text
(venv)
```

al principio de la línea de PowerShell.

---

## 4. Instalar dependencias

```powershell
pip install -r requirements.txt
```

Dependencias principales:

```text
Flask
Flask-Cors
Pillow
```

---

# ▶️ Ejecutar el backend

Con el entorno virtual activado:

```powershell
python app.py
```

El servidor quedará disponible en:

```text
http://localhost:5000
```

Para comprobarlo, abre:

```text
http://localhost:5000
```

Deberías recibir una respuesta similar a:

```json
{
  "message": "Sticker2WhatsApp API funcionando",
  "status": "ok"
}
```

---

# 🌐 Ejecutar el frontend

El frontend utiliza un servidor HTTP local.

Abre otra ventana de PowerShell:

```powershell
cd $HOME\Documents\sticker2whatsapp\frontend
```

Después:

```powershell
python -m http.server 5500
```

La aplicación estará disponible en:

```text
http://localhost:5500
```

Abre esa dirección en Google Chrome o Microsoft Edge.

---

# 🔄 Funcionamiento

El flujo actual de la aplicación es:

```text
┌─────────────────────────────┐
│       Sticker2WhatsApp      │
└──────────────┬──────────────┘
               │
               ▼
      Seleccionar carpeta
          de Telegram
               │
               ▼
       Buscar imágenes
       y subcarpetas
               │
               ▼
       Mostrar stickers
               │
               ▼
      Seleccionar stickers
               │
               ▼
       Seleccionar carpeta
           de destino
               │
               ▼
        Enviar sticker
          al backend
               │
               ▼
        Flask + Pillow
               │
               ▼
        Convertir a WebP
               │
               ▼
      Guardar en carpeta
          seleccionada
```

---

# 🔌 API

## Convertir stickers

### Endpoint

```text
POST /api/convert
```

### Campo utilizado

```text
stickers
```

El frontend envía los archivos mediante `multipart/form-data`.

### Respuesta para un sticker

El backend devuelve:

```text
sticker.webp
```

### Respuesta para varios stickers

El backend devuelve:

```text
stickers-whatsapp.zip
```

El ZIP funciona como respaldo para conversiones múltiples.

---

# 🔐 Seguridad y validaciones

Actualmente el backend valida:

* Que se haya recibido al menos un archivo.
* Máximo de 50 archivos.
* Máximo de 10 MB por archivo.
* Extensiones permitidas.
* Que el archivo realmente sea una imagen válida.

Los archivos utilizados durante la conversión se almacenan temporalmente en:

```text
backend/temp/
```

Después de cada conversión, la carpeta temporal utilizada se elimina.

---

# 🌐 Compatibilidad del navegador

La selección directa de carpetas utiliza:

```text
File System Access API
```

Esta funcionalidad está orientada principalmente a navegadores basados en Chromium.

Se recomienda utilizar:

* Google Chrome
* Microsoft Edge

Especialmente en PC.

La aplicación necesita permiso del usuario para acceder a las carpetas seleccionadas.

---

# 📱 PWA

Sticker2WhatsApp está preparado como Progressive Web App.

Componentes:

```text
manifest.json
sw.js
```

La PWA permite que la aplicación pueda instalarse desde un navegador compatible.

Los iconos requeridos son:

```text
frontend/assets/icon-192.png
frontend/assets/icon-512.png
```

---

# 🚧 Limitaciones actuales

Esta versión es un MVP.

Actualmente:

* Solo se procesan stickers basados en imágenes.
* Los stickers animados de Telegram como `.tgs` todavía no se convierten.
* Los stickers `.webm` todavía no se procesan.
* Los GIF se convierten actualmente como imágenes estáticas.
* La selección directa de carpetas depende del soporte del navegador.
* No existe sistema de usuarios.
* No existe base de datos.
* No existe autenticación.
* No existe panel administrativo.
* No existe almacenamiento permanente en servidor.

---

# 🔮 Próximas mejoras

Posibles mejoras futuras:

## Telegram

* Soporte para `.tgs`.
* Soporte para `.webm`.
* Conversión de stickers animados.
* Detección más avanzada de paquetes de stickers.
* Lectura de estructuras específicas de Telegram.

## WhatsApp

* Optimización específica para stickers de WhatsApp.
* Validación más estricta de dimensiones.
* Mejor control del tamaño final.
* Soporte para paquetes de stickers.

## Interfaz

* Drag & Drop.
* Barra de progreso.
* Contador de archivos procesados.
* Mejor vista previa.
* Animaciones.
* Tema oscuro.
* Historial de conversiones.

## PWA

* Instalación mejorada.
* Iconos definitivos.
* Splash screen.
* Mejor funcionamiento offline.
* Actualización automática del Service Worker.

---

# 🛠️ Desarrollo local

Para desarrollar el proyecto se necesitan dos terminales.

### Terminal 1 — Backend

```powershell
cd $HOME\Documents\sticker2whatsapp\backend
.\venv\Scripts\Activate.ps1
python app.py
```

### Terminal 2 — Frontend

```powershell
cd $HOME\Documents\sticker2whatsapp\frontend
python -m http.server 5500
```

Después abrir:

```text
http://localhost:5500
```

---

# 📁 Estructura final

```text
sticker2whatsapp/
│
├── README.md
│
├── backend/
│   │
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   └── convert.py
│   │
│   ├── services/
│   │   └── sticker_converter.py
│   │
│   ├── temp/
│   │
│   └── venv/
│
└── frontend/
    │
    ├── index.html
    ├── manifest.json
    ├── sw.js
    │
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   └── app.js
    │
    └── assets/
        ├── icon-192.png
        └── icon-512.png
```

---

# 📄 Licencia

Proyecto en desarrollo.

La licencia y las condiciones de distribución serán definidas posteriormente.

---

# 👨‍💻 Estado del proyecto

**Sticker2WhatsApp — MVP**

Versión:

```text
0.1.0
```

Estado:

```text
En desarrollo
```

Objetivo actual:

```text
Telegram → WhatsApp
```

---

## 🚀 Inicio rápido

```powershell
# Backend
cd $HOME\Documents\sticker2whatsapp\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

En otra terminal:

```powershell
# Frontend
cd $HOME\Documents\sticker2whatsapp\frontend
python -m http.server 5500
```

Abrir:

```text
http://localhost:5500
```

**Sticker2WhatsApp**
*Convierte tus stickers de Telegram para utilizarlos en WhatsApp.*
