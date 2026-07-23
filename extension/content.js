// Content script de Halcón: inyecta un botón flotante en Instagram y
// WhatsApp Web para capturar un prospecto de 1 clic hacia el CRM.

(function () {
  if (window.__halconInjected) return;
  window.__halconInjected = true;

  const btn = document.createElement("button");
  btn.id = "halcon-capture-btn";
  btn.innerHTML = "🦅 Capturar con Halcón";
  document.documentElement.appendChild(btn);

  const toast = document.createElement("div");
  toast.id = "halcon-toast";
  document.documentElement.appendChild(toast);

  function showToast(msg, ok = true) {
    toast.textContent = msg;
    toast.className = ok ? "ok" : "err";
    toast.style.opacity = "1";
    setTimeout(() => (toast.style.opacity = "0"), 3500);
  }

  // Extrae datos del prospecto según la página.
  function extractProspect() {
    const host = location.hostname;
    if (host.includes("instagram.com")) {
      // El primer segmento del path suele ser el @usuario del perfil.
      const seg = location.pathname.split("/").filter(Boolean)[0] || "";
      const handle = seg && !["p", "reels", "explore", "direct"].includes(seg)
        ? "@" + seg
        : "";
      // Nombre visible (header h2/h1) como mejor esfuerzo.
      const nameEl = document.querySelector("header h2, header h1");
      const name = nameEl?.textContent?.trim() || handle.replace("@", "") || "Prospecto IG";
      return {
        fullName: name,
        instagram: handle,
        country: "",
        notes: "",
        sourceUrl: location.href.split("?")[0],
      };
    }
    if (host.includes("web.whatsapp.com")) {
      const titleEl = document.querySelector(
        'header [data-testid="conversation-info-header-chat-title"], header span[title]'
      );
      const name = titleEl?.getAttribute("title") || titleEl?.textContent?.trim() || "Prospecto WA";
      return {
        fullName: name,
        instagram: "",
        country: "",
        notes: "Capturada desde WhatsApp Web",
        sourceUrl: "",
      };
    }
    return { fullName: "Prospecto", sourceUrl: location.href };
  }

  btn.addEventListener("click", () => {
    const prospect = extractProspect();
    const edited = window.prompt(
      "Confirmá el nombre/@ del prospecto a capturar:",
      prospect.fullName
    );
    if (edited === null) return; // cancelado
    prospect.fullName = edited.trim() || prospect.fullName;

    btn.disabled = true;
    btn.innerHTML = "⏳ Capturando…";
    chrome.runtime.sendMessage(
      { type: "HALCON_CAPTURE", payload: prospect },
      (resp) => {
        btn.disabled = false;
        btn.innerHTML = "🦅 Capturar con Halcón";
        if (resp?.ok) {
          showToast("✅ Prospecto capturado en el CRM", true);
        } else {
          showToast("⚠️ " + (resp?.error || "No se pudo capturar"), false);
        }
      }
    );
  });
})();
