"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewModelButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    instagram: "",
    whatsapp: "",
    country: "",
    notes: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ fullName: "", instagram: "", whatsapp: "", country: "", notes: "" });
      router.refresh();
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Nueva modelo
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
            <h3 className="text-lg font-semibold">Nueva modelo (prospecto)</h3>
            <div>
              <label className="label">Nombre completo *</label>
              <input
                className="input"
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Instagram</label>
                <input
                  className="input"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                />
              </div>
              <div>
                <label className="label">WhatsApp</label>
                <input
                  className="input"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">País</label>
              <input
                className="input"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Notas</label>
              <textarea
                className="input"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
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
