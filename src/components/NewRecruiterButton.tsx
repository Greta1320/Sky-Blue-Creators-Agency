"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewRecruiterButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    commissionRate: "0.5",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        commissionRate: Number(form.commissionRate),
      }),
    });
    setLoading(false);
    const d = await res.json();
    if (res.ok) {
      setOpen(false);
      setForm({ name: "", email: "", password: "", commissionRate: "0.5" });
      router.refresh();
    } else {
      setError(d.error || "No se pudo crear");
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Nuevo vendedor
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
            <h3 className="text-lg font-semibold">Nuevo vendedor</h3>
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <input
                className="input"
                type="text"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
            <div>
              <label className="label">
                Comisión sobre neto (0–1, ej. 0.5 = 50%)
              </label>
              <input
                className="input"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={form.commissionRate}
                onChange={(e) => set("commissionRate", e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" disabled={loading}>
                {loading ? "Creando…" : "Crear vendedor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
