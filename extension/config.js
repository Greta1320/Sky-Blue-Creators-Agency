// Configuración de la extensión Halcón.
// La URL base de la API se puede cambiar desde la pantalla de ajustes del popup;
// este es solo el valor por defecto (desarrollo local).
const HALCON_DEFAULTS = {
  // Apunta por defecto a la instancia online. Se puede cambiar en Ajustes.
  apiBase: "https://skyblue-opal.vercel.app",
};

// Claves usadas en chrome.storage.local
const STORAGE_KEYS = {
  token: "halcon_token",
  user: "halcon_user",
  apiBase: "halcon_api_base",
};

async function getApiBase() {
  const { [STORAGE_KEYS.apiBase]: base } = await chrome.storage.local.get(
    STORAGE_KEYS.apiBase
  );
  return (base || HALCON_DEFAULTS.apiBase).replace(/\/$/, "");
}

async function getToken() {
  const { [STORAGE_KEYS.token]: token } = await chrome.storage.local.get(
    STORAGE_KEYS.token
  );
  return token || null;
}

// Fetch autenticado a la API (agrega el bearer token).
async function apiFetch(path, options = {}) {
  const base = await getApiBase();
  const token = await getToken();
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  return { ok: res.ok, status: res.status, data };
}
