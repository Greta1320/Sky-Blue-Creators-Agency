"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewMarketOwnerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    market: "",
    contact: "",
    groups: "",
    cutRate: "0.4",
    notes: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/market-owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cutRate: Number(form.cutRate) }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({
        name: "",
        market: "",
        contact: "",
        groups: "",
        cutRate: "0.4",
        notes: "",
      });
      router.refresh();
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Nuevo dueño de mercado
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="card w-full max-w-md space-y-3 p-6"
          >
            <h3 className="text-lg font-semibold">Nuevo dueño de mercado</h3>
            <p className="text-xs text-slate-400">
              🔒 Información confidencial: solo visible para vos (master).
            </p>
            <div>
              <label className="label">Nombre / alias *</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Plaza / mercado</label>
                <input
                  className="input"
                  placeholder="Dubai, Portugal…"
                  value={form.market}
                  onChange={(e) => set("market", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Corte (0–1)</label>
                <input
                  className="input"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={form.cutRate}
                  onChange={(e) => set("cutRate", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Contacto (WhatsApp/Telegram)</label>
              <input
                className="input"
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Grupos</label>
              <input
                className="input"
                value={form.groups}
                onChange={(e) => set("groups", e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" disabled={loading}>
                {loading ? "Guardando…" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
