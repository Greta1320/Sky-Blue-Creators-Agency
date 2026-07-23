"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AplicarPage() {
  return (
    <Suspense fallback={null}>
      <AplicarForm />
    </Suspense>
  );
}

function AplicarForm() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    stageName: "",
    instagram: "",
    whatsapp: "",
    email: "",
    age: "",
    country: "",
    city: "",
    languages: "",
    experience: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, recruiterRef: ref || undefined }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else {
      const d = await res.json();
      setError(d.error || "Revisá los datos e intentá de nuevo.");
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-800 p-4">
        <div className="card max-w-md p-8 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <h1 className="text-xl font-bold text-slate-800">
            ¡Formulario enviado!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Recibimos tus datos. El equipo de Sky Blue Creators se pondrá en
            contacto con vos muy pronto.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-500 to-sky-800 p-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
            <Logo size={44} />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Sky Blue Creators Agency</h1>
          <p className="text-sky-100">
            Completá tus datos para postularte. Es rápido y confidencial.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
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
              <label className="label">Nombre artístico</label>
              <input
                className="input"
                value={form.stageName}
                onChange={(e) => set("stageName", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Edad</label>
              <input
                className="input"
                type="number"
                min={18}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Instagram</label>
              <input
                className="input"
                placeholder="@usuario"
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
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">País</label>
              <input
                className="input"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input
                className="input"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Idiomas</label>
            <input
              className="input"
              placeholder="Español, inglés…"
              value={form.languages}
              onChange={(e) => set("languages", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Experiencia previa</label>
            <textarea
              className="input"
              rows={3}
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar postulación"}
          </button>
          {ref && (
            <p className="text-center text-xs text-slate-400">
              Referida por un asesor de Sky Blue.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
