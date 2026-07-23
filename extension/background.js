// Service worker de Halcón.
// Recibe capturas desde el content script (botón en Instagram/WhatsApp)
// y las manda a la API con el token guardado.

const KEYS = {
  token: "halcon_token",
  apiBase: "halcon_api_base",
};
const DEFAULT_API = "http://localhost:3000";

async function apiBase() {
  const { [KEYS.apiBase]: base } = await chrome.storage.local.get(KEYS.apiBase);
  return (base || DEFAULT_API).replace(/\/$/, "");
}

async function token() {
  const { [KEYS.token]: t } = await chrome.storage.local.get(KEYS.token);
  return t || null;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "HALCON_CAPTURE") {
    (async () => {
      const t = await token();
      if (!t) {
        sendResponse({ ok: false, error: "No hay sesión. Abrí Halcón e iniciá sesión." });
        return;
      }
      try {
        const res = await fetch((await apiBase()) + "/api/extension/capture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
          body: JSON.stringify(msg.payload),
        });
        const data = await res.json().catch(() => null);
        sendResponse({ ok: res.ok, data, error: data?.error });
      } catch (e) {
        sendResponse({ ok: false, error: "Error de conexión con la API." });
      }
    })();
    return true; // respuesta asíncrona
  }
});
