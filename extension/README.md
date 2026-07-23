# 🦅 Halcón — Extensión de Chrome

Herramienta de prospección de **Sky Blue Creators Agency**. Para Matías y sus
vendedores.

## Qué hace

- **Capturar prospectos** — de 1 clic desde Instagram o WhatsApp Web (botón
  flotante) o desde el popup. La modelo entra al CRM como *Prospectada*
  asignada al vendedor que la capturó.
- **Ver mi pipeline** — resumen de tus modelos (total, colocadas, en garantía)
  y las últimas cargadas, sin abrir la web.
- **Kit de prospección** — scripts, FAQs e ideas de contenido a mano.
- **Vista master** — si sos Matías, ves además los totales de comisiones
  (parte tuya, de los vendedores y pendiente).

## Instalación (modo desarrollador)

1. Entrá a `chrome://extensions`.
2. Activá **Modo desarrollador** (arriba a la derecha).
3. **Cargar descomprimida** → seleccioná esta carpeta `extension/`.
4. Fijá Halcón en la barra (ícono del halcón 🦅).

## Configuración

1. Abrí el popup de Halcón.
2. Tocá **Ajustes de conexión** y poné la URL de la API:
   - Desarrollo: `http://localhost:3000`
   - Producción: la URL de tu deploy (p. ej. `https://tu-app.vercel.app`)
3. Iniciá sesión con tu email y contraseña de Sky Blue.

> El token se guarda en `chrome.storage.local` y se manda como
> `Authorization: Bearer` a la API. Cerrá sesión desde el popup para borrarlo.

## Uso rápido

- **En Instagram**: entrá al perfil de la modelo → botón **"🦅 Capturar"**
  (abajo a la derecha) → confirmás el nombre/@ → queda en el CRM.
- **En WhatsApp Web**: abrí el chat → mismo botón.
- **Desde el popup**: pestaña **Capturar**, completás y guardás.

## Archivos

| Archivo | Rol |
| --- | --- |
| `manifest.json` | Definición MV3 (permisos, popup, content scripts). |
| `config.js` | URL de la API + helper `apiFetch` (bearer token). |
| `background.js` | Service worker: recibe capturas del content script. |
| `content.js` / `content.css` | Botón flotante e extracción del prospecto. |
| `popup.html` / `popup.css` / `popup.js` | Interfaz del popup. |
| `icons/` | Íconos 16/48/128. |

## Publicar en la Chrome Web Store

1. Reemplazá los íconos por el logo real de Sky Blue.
2. Ajustá `host_permissions` al dominio real de la API (sacá el `https://*/*`
   amplio de desarrollo).
3. Comprimí la carpeta `extension/` en un `.zip` y subilo al panel de
   desarrolladores de Chrome.
