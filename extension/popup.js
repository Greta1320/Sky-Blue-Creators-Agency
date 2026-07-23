// Lógica del popup de Halcón.

const $ = (id) => document.getElementById(id);
const STATUS_LABELS = {
  PROSPECTADA: "Prospectada",
  FORMULARIO_COMPLETO: "Formulario",
  LISTING_ARMADO: "Listing",
  ENVIADA_MERCADO: "En mercado",
  COLOCADA: "Colocada",
  EN_GARANTIA: "En garantía",
  COBRADA: "Cobrada",
  GARANTIA_ROTA: "Garantía rota",
  PERDIDA: "Perdida",
};

async function init() {
  // Prellenar URL de API en ajustes.
  $("apiBase").value = await getApiBase();

  const token = await getToken();
  if (token) {
    const me = await apiFetch("/api/auth/me");
    if (me.ok) {
      showApp(me.data.user);
      return;
    }
    // Token inválido → limpiar.
    await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
  }
  showLogin();
}

function showLogin() {
  $("loginView").classList.remove("hidden");
  $("appView").classList.add("hidden");
  $("userChip").classList.add("hidden");
}

async function showApp(user) {
  await chrome.storage.local.set({ [STORAGE_KEYS.user]: user });
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  const chip = $("userChip");
  chip.textContent = user.role === "MASTER" ? "Master" : user.name.split(" ")[0];
  chip.classList.remove("hidden");
  // Prefill capture desde la pestaña activa (mejor esfuerzo).
  prefillFromActiveTab();
  loadPipeline();
  loadKit();
}

// ── Login ──
$("loginBtn").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const err = $("loginError");
  err.classList.add("hidden");
  if (!email || !password) return;
  $("loginBtn").disabled = true;
  $("loginBtn").textContent = "Ingresando…";

  const base = ($("apiBase").value.trim() || (await getApiBase())).replace(/\/$/, "");
  await chrome.storage.local.set({ [STORAGE_KEYS.apiBase]: base });

  try {
    const res = await fetch(base + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, mode: "token" }),
    });
    const data = await res.json();
    if (!res.ok) {
      err.textContent = data.error || "No se pudo iniciar sesión";
      err.classList.remove("hidden");
    } else {
      await chrome.storage.local.set({ [STORAGE_KEYS.token]: data.token });
      showApp(data.user);
    }
  } catch {
    err.textContent = "Error de conexión. Revisá la URL de la API en ajustes.";
    err.classList.remove("hidden");
  } finally {
    $("loginBtn").disabled = false;
    $("loginBtn").textContent = "Ingresar";
  }
});

$("settingsToggle").addEventListener("click", () => {
  $("settings").classList.toggle("hidden");
});
$("saveApi").addEventListener("click", async () => {
  const base = $("apiBase").value.trim().replace(/\/$/, "");
  await chrome.storage.local.set({ [STORAGE_KEYS.apiBase]: base });
  $("saveApi").textContent = "Guardado ✓";
  setTimeout(() => ($("saveApi").textContent = "Guardar URL"), 1500);
});

$("logoutBtn").addEventListener("click", async () => {
  await chrome.storage.local.remove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
  showLogin();
});

// ── Tabs ──
document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    document
      .querySelectorAll(".tabpane")
      .forEach((p) => p.classList.add("hidden"));
    $("tab-" + t.dataset.tab).classList.remove("hidden");
  });
});

// ── Capturar ──
async function prefillFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const u = new URL(tab.url);
    if (u.hostname.includes("instagram.com")) {
      const seg = u.pathname.split("/").filter(Boolean)[0];
      if (seg && !["p", "reels", "explore", "direct"].includes(seg)) {
        $("cIg").value = "@" + seg;
        $("cName").value = seg;
      }
    }
  } catch {
    /* sin permiso de tab, ignorar */
  }
}

$("captureBtn").addEventListener("click", async () => {
  const payload = {
    fullName: $("cName").value.trim(),
    instagram: $("cIg").value.trim(),
    whatsapp: $("cWa").value.trim(),
    country: $("cCountry").value.trim(),
    notes: $("cNotes").value.trim(),
  };
  const msg = $("captureMsg");
  if (!payload.fullName) {
    msg.textContent = "Poné al menos un nombre o @usuario.";
    msg.className = "msg err";
    msg.classList.remove("hidden");
    return;
  }
  $("captureBtn").disabled = true;
  const res = await apiFetch("/api/extension/capture", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  $("captureBtn").disabled = false;
  if (res.ok) {
    msg.textContent = "✅ Prospecto capturado.";
    msg.className = "msg ok";
    ["cName", "cIg", "cWa", "cCountry", "cNotes"].forEach((id) => ($(id).value = ""));
    loadPipeline();
  } else {
    msg.textContent = "⚠️ " + (res.data?.error || "No se pudo capturar");
    msg.className = "msg err";
  }
  msg.classList.remove("hidden");
});

// ── Pipeline ──
async function loadPipeline() {
  const stats = $("pipelineStats");
  const [metrics, models] = await Promise.all([
    apiFetch("/api/metrics"),
    apiFetch("/api/models"),
  ]);

  if (metrics.ok) {
    const m = metrics.data.metrics;
    stats.innerHTML = `
      <div class="stat"><b>${m.total}</b><span>Modelos</span></div>
      <div class="stat"><b>${m.placed + m.cobrada}</b><span>Colocadas</span></div>
      <div class="stat"><b>${m.enGarantia}</b><span>En garantía</span></div>`;

    // Vista master: total de ganancias.
    const master = $("masterStats");
    const me = (await chrome.storage.local.get(STORAGE_KEYS.user))[STORAGE_KEYS.user];
    if (me?.role === "MASTER") {
      master.classList.remove("hidden");
      master.innerHTML = `<div class="stats">
        <div class="stat"><b>$${Math.round(m.earnings.matias)}</b><span>Matías</span></div>
        <div class="stat"><b>$${Math.round(m.earnings.recruiter)}</b><span>Vendedores</span></div>
        <div class="stat"><b>$${Math.round(m.earnings.pending)}</b><span>Pendiente</span></div>
      </div>`;
    } else {
      master.classList.add("hidden");
    }
  }

  const list = $("modelList");
  if (models.ok) {
    const items = models.data.models.slice(0, 12);
    list.innerHTML =
      items
        .map(
          (mo) => `<li><span>${escapeHtml(mo.stageName || mo.fullName)}</span>
        <span class="badge">${STATUS_LABELS[mo.status] || mo.status}</span></li>`
        )
        .join("") || '<li><span class="muted">Sin modelos todavía.</span></li>';
  }
}

// ── Kit ──
async function loadKit() {
  const res = await apiFetch("/api/training");
  const cont = $("kitList");
  if (!res.ok) {
    cont.innerHTML = '<p class="muted">No se pudo cargar el kit.</p>';
    return;
  }
  const kinds = { SCRIPT: "Scripts", FAQ: "FAQs", CONTENT_IDEA: "Ideas de contenido", GUIA: "Guías" };
  const grouped = {};
  for (const r of res.data.resources) (grouped[r.kind] ||= []).push(r);

  let html = "";
  for (const [kind, label] of Object.entries(kinds)) {
    const items = grouped[kind] || [];
    if (!items.length) continue;
    html += `<div class="kit-kind">${label}</div>`;
    html += items
      .map(
        (r) => `<div class="kit-item"><h5>${escapeHtml(r.title)}</h5>
        <p>${escapeHtml(r.body)}</p></div>`
      )
      .join("");
  }
  cont.innerHTML = html || '<p class="muted">El kit todavía está vacío.</p>';
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

init();
