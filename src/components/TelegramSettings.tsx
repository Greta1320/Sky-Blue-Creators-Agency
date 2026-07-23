"use client";

import { useEffect, useState } from "react";

export function TelegramSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [fromEnv, setFromEnv] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/integrations/telegram")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(d.configured);
        setChatId(d.chatId || "");
        setFromEnv(d.fromEnv);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(test: boolean) {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/integrations/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botToken: botToken || undefined,
        chatId: chatId || undefined,
        test,
      }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setConfigured(true);
      setBotToken("");
      setMsg({
        ok: true,
        text: test ? "Mensaje de prueba enviado ✓" : "Guardado ✓",
      });
    } else {
      setMsg({ ok: false, text: d.error || "No se pudo guardar" });
    }
  }

  if (loading) return <p className="text-slate-400">Cargando…</p>;

  return (
    <div className="card max-w-xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">✈️</span>
        <div>
          <h2 className="font-semibold text-slate-800">Telegram</h2>
          <p className="text-sm text-slate-500">
            {configured
              ? "Conectado. Recibís aviso cuando entra una modelo y podés enviar listings."
              : "Conectá tu bot para recibir avisos y enviar listings."}
          </p>
        </div>
      </div>

      {fromEnv && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Configurado por variables de entorno del servidor.
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">Token del bot (BotFather)</label>
          <input
            className="input"
            placeholder={configured ? "•••••• (ya guardado, dejá vacío para no cambiar)" : "123456:ABC-DEF..."}
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Chat ID (tu chat o grupo)</label>
          <input
            className="input"
            placeholder="123456789"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
        </div>

        {msg && (
          <p
            className={`rounded px-3 py-2 text-sm ${
              msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            }`}
          >
            {msg.text}
          </p>
        )}

        <div className="flex gap-2">
          <button
            className="btn-ghost"
            onClick={() => save(false)}
            disabled={saving}
          >
            Guardar
          </button>
          <button
            className="btn-primary"
            onClick={() => save(true)}
            disabled={saving}
          >
            Guardar y probar
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="mb-2 font-medium text-slate-700">¿Cómo obtener los datos?</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            En Telegram, hablá con <b>@BotFather</b> → <code>/newbot</code> →
            te da el <b>token</b>.
          </li>
          <li>
            Escribile algo a tu bot nuevo (o agregalo a un grupo).
          </li>
          <li>
            Para el <b>Chat ID</b>: hablá con <b>@userinfobot</b> (te da tu ID),
            o usá el ID del grupo.
          </li>
          <li>Pegá ambos acá y tocá “Guardar y probar”.</li>
        </ol>
      </div>
    </div>
  );
}
