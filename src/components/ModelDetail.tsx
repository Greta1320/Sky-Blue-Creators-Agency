"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { ALL_MODEL_STATUS, STATUS_LABELS } from "@/lib/constants";
import { calcCommission } from "@/lib/commissions";
import { money } from "@/lib/format";
import { QUESTION_LABELS } from "@/lib/listing";

interface Props {
  master: boolean;
  model: any;
  marketOwners: { id: string; name: string; cutRate: number }[];
}

export function ModelDetail({ master, model, marketOwners }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(model.status);
  const [note, setNote] = useState("");
  const [tgMsg, setTgMsg] = useState<string | null>(null);

  const questionnaire: Record<string, string> | null = (() => {
    try {
      return model.formData ? JSON.parse(model.formData) : null;
    } catch {
      return null;
    }
  })();

  async function regenerateListing() {
    setSaving(true);
    const res = await fetch(`/api/models/${model.id}/relisting`, {
      method: "POST",
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setForm((f) => ({ ...f, listingText: d.model.listingText || "" }));
    } else {
      alert("No se pudo regenerar el listing");
    }
  }

  function copyListing() {
    navigator.clipboard?.writeText(form.listingText || "");
    setTgMsg("Listing copiado ✓");
    setTimeout(() => setTgMsg(null), 2000);
  }

  async function sendTelegram() {
    setSaving(true);
    setTgMsg(null);
    // Guardar primero el listing actual para enviar lo que se ve.
    await fetch(`/api/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingText: form.listingText }),
    });
    const res = await fetch(`/api/models/${model.id}/send-telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setSaving(false);
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setTgMsg("Enviado por Telegram ✓");
      router.refresh();
    } else {
      setTgMsg("⚠️ " + (d.error || "No se pudo enviar. Configurá Telegram en Integraciones."));
    }
  }
  const [form, setForm] = useState({
    price: model.price ?? "",
    listingText: model.listingText ?? "",
    agency: model.agency ?? "",
    dealType: model.dealType ?? "",
    dealAmount: model.dealAmount ?? "",
    marketOwnerId: model.marketOwnerId ?? "",
    notes: model.notes ?? "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function changeStatus() {
    setSaving(true);
    const res = await fetch(`/api/models/${model.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    setSaving(false);
    if (res.ok) {
      setNote("");
      router.refresh();
    } else {
      const d = await res.json();
      alert(d.error || "No se pudo cambiar el estado");
    }
  }

  async function save() {
    setSaving(true);
    const payload: Record<string, unknown> = { notes: form.notes };
    if (master) {
      payload.price = form.price === "" ? undefined : Number(form.price);
      payload.listingText = form.listingText;
      payload.agency = form.agency;
      payload.dealType = form.dealType || undefined;
      payload.dealAmount =
        form.dealAmount === "" ? undefined : Number(form.dealAmount);
      payload.marketOwnerId = form.marketOwnerId || null;
    }
    const res = await fetch(`/api/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json();
      alert(d.error || "No se pudo guardar");
    }
  }

  // Previsualización de comisión (solo master).
  const owner = marketOwners.find((o) => o.id === form.marketOwnerId);
  const base = Number(form.dealAmount || form.price || 0);
  const preview = calcCommission(base, owner?.cutRate ?? 0.4, 0.5);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-6 lg:col-span-2">
        {/* Cambio de estado */}
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-semibold">Pipeline</h2>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">Estado actual:</span>
            <StatusBadge status={model.status} />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Mover a</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {ALL_MODEL_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="label">Nota (opcional)</label>
              <input
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={changeStatus}
              disabled={saving || status === model.status}
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Listing y cierre (master) */}
        {master && (
          <div className="card p-6">
            <h2 className="mb-3 text-lg font-semibold">Listing y cierre</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Precio de la modelo (USD)</label>
                <input
                  className="input"
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Dueño de mercado</label>
                <select
                  className="input"
                  value={form.marketOwnerId}
                  onChange={(e) => set("marketOwnerId", e.target.value)}
                >
                  <option value="">— Sin asignar —</option>
                  {marketOwners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({Math.round(o.cutRate * 100)}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Agencia</label>
                <input
                  className="input"
                  value={form.agency}
                  onChange={(e) => set("agency", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tipo de acuerdo</label>
                <select
                  className="input"
                  value={form.dealType}
                  onChange={(e) => set("dealType", e.target.value)}
                >
                  <option value="">—</option>
                  <option value="FIJO">Sueldo fijo</option>
                  <option value="SPLIT">Split (%)</option>
                </select>
              </div>
              <div>
                <label className="label">Monto del acuerdo (USD)</label>
                <input
                  className="input"
                  type="number"
                  value={form.dealAmount}
                  onChange={(e) => set("dealAmount", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="label mb-0">Listing (formato 🎖️)</label>
                <button
                  type="button"
                  onClick={regenerateListing}
                  className="text-xs font-medium text-sky-700 hover:underline"
                  disabled={saving}
                >
                  ↻ Regenerar desde el formulario
                </button>
              </div>
              <textarea
                className="input font-mono text-xs"
                rows={16}
                value={form.listingText}
                onChange={(e) => set("listingText", e.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={copyListing}
                >
                  📋 Copiar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={sendTelegram}
                  disabled={saving || !form.listingText}
                >
                  ✈️ Enviar por Telegram
                </button>
                {tgMsg && (
                  <span className="text-sm text-slate-600">{tgMsg}</span>
                )}
              </div>
            </div>

            {base > 0 && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
                <p className="mb-2 font-medium text-slate-700">
                  Comisión sugerida (sobre {money(base)})
                </p>
                <p className="mb-2 text-xs text-slate-400">
                  Es solo una referencia. Al marcar “Cobrada” se crea un borrador
                  que completás y ajustás en la sección Comisiones.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Dueño mercado</p>
                    <p className="font-semibold">{money(preview.marketCut)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Vendedor</p>
                    <p className="font-semibold text-sky-700">
                      {money(preview.recruiterShare)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Matías</p>
                    <p className="font-semibold">{money(preview.matiasShare)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card p-6">
          <label className="label">Notas</label>
          <textarea
            className="input"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          <div className="mt-3 text-right">
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-6">
        {/* Respuestas del formulario */}
        {questionnaire && (
          <div className="card h-fit p-6">
            <h2 className="mb-3 text-lg font-semibold">Formulario de la modelo</h2>
            <dl className="space-y-2 text-sm">
              {QUESTION_LABELS.filter((q) => {
                const val = questionnaire[q.key];
                return val !== undefined && val !== null && val !== "";
              }).map((q) => (
                <div key={q.key} className="flex justify-between gap-3">
                  <dt className="text-slate-400">{q.label}</dt>
                  <dd className="text-right font-medium text-slate-700">
                    {String(questionnaire[q.key])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Historial */}
        <div className="card h-fit p-6">
          <h2 className="mb-3 text-lg font-semibold">Historial</h2>
        <ol className="space-y-3">
          {model.statusEvents?.map((ev: any) => (
            <li key={ev.id} className="border-l-2 border-sky-200 pl-3">
              <p className="text-sm font-medium text-slate-700">
                {STATUS_LABELS[ev.toStatus] || ev.toStatus}
              </p>
              {ev.note && <p className="text-xs text-slate-500">{ev.note}</p>}
              <p className="text-xs text-slate-400">
                {new Date(ev.createdAt).toLocaleString("es-AR")}
              </p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
