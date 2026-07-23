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

const SI_NO = ["", "Sí", "No"];

function AplicarForm() {
  const params = useSearchParams();
  const ref = params.get("ref") || "";
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/public/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, recruiterRef: ref || undefined }),
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-900 p-4">
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
    <main className="min-h-screen bg-gradient-to-br from-sky-500 to-sky-900 p-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
            <Logo size={44} />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Sky Blue Creators Agency</h1>
          <p className="text-sky-100">
            Completá el formulario. Es confidencial: no se usan tus redes ni se
            publica en tu país.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Datos básicos */}
          <Section title="Datos básicos">
            <Field label="Nombre *">
              <input
                className="input"
                required
                value={f.nombre || ""}
                onChange={(e) => set("nombre", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Edad">
                <input
                  className="input"
                  type="number"
                  min={18}
                  value={f.edad || ""}
                  onChange={(e) => set("edad", e.target.value)}
                />
              </Field>
              <Field label="Nacionalidad">
                <input
                  className="input"
                  value={f.nacionalidad || ""}
                  onChange={(e) => set("nacionalidad", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram">
                <input
                  className="input"
                  placeholder="@usuario"
                  value={f.instagram || ""}
                  onChange={(e) => set("instagram", e.target.value)}
                />
              </Field>
              <Field label="Usuario de Telegram">
                <input
                  className="input"
                  placeholder="@usuario"
                  value={f.telegram || ""}
                  onChange={(e) => set("telegram", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="WhatsApp">
                <input
                  className="input"
                  value={f.whatsapp || ""}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </Field>
              <Field label="Modelo de celular">
                <input
                  className="input"
                  value={f.celular || ""}
                  onChange={(e) => set("celular", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Trabajo */}
          <Section title="Sobre el trabajo">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tiempo por día para trabajar">
                <input
                  className="input"
                  placeholder="ej. 4 horas"
                  value={f.tiempoPorDia || ""}
                  onChange={(e) => set("tiempoPorDia", e.target.value)}
                />
              </Field>
              <Field label="Inglés (1-10)">
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={10}
                  value={f.ingles || ""}
                  onChange={(e) => set("ingles", e.target.value)}
                />
              </Field>
            </div>
            <SelectField
              label="¿Harías TikTok/Reels? (no se usan tus redes ni se publica en tu país)"
              value={f.reelsTiktok || ""}
              onChange={(v) => set("reelsTiktok", v)}
            />
            <Field label="Países a bloquear">
              <input
                className="input"
                value={f.paisesBloquear || ""}
                onChange={(e) => set("paisesBloquear", e.target.value)}
              />
            </Field>
            <SelectField
              label="Sueldo seguro o porcentaje (aclarar cantidad o %)"
              value={f.sueldoOPorcentaje || ""}
              onChange={(v) => set("sueldoOPorcentaje", v)}
              options={["", "Sueldo seguro", "Porcentaje", "Cualquiera"]}
            />
          </Section>

          {/* Contenido explícito */}
          <Section title="Contenido explícito (especificá qué sí y qué no)">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Masturbación (con/sin dildo)"
                value={f.masturbacion || ""}
                onChange={(v) => set("masturbacion", v)}
              />
              <SelectField
                label="¿Tiene juguetes / dildo?"
                value={f.juguetes || ""}
                onChange={(v) => set("juguetes", v)}
              />
              <SelectField
                label="Sexo con hombre"
                value={f.sexoHombre || ""}
                onChange={(v) => set("sexoHombre", v)}
              />
              <SelectField
                label="Sexo con mujer"
                value={f.sexoMujer || ""}
                onChange={(v) => set("sexoMujer", v)}
              />
              <SelectField
                label="Anal"
                value={f.anal || ""}
                onChange={(v) => set("anal", v)}
              />
              <SelectField
                label="Videollamadas"
                value={f.videollamadas || ""}
                onChange={(v) => set("videollamadas", v)}
              />
              <SelectField
                label="Lives"
                value={f.lives || ""}
                onChange={(v) => set("lives", v)}
              />
            </div>
          </Section>

          {/* Cuenta y experiencia */}
          <Section title="Cuenta y experiencia">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="¿OF verificado?"
                value={f.ofVerificado || ""}
                onChange={(v) => set("ofVerificado", v)}
              />
              <SelectField
                label="¿Tenés pasaporte?"
                value={f.pasaporte || ""}
                onChange={(v) => set("pasaporte", v)}
              />
              <SelectField
                label="¿Trabajás con alguna agencia?"
                value={f.trabajaConAgencia || ""}
                onChange={(v) => set("trabajaConAgencia", v)}
              />
              <Field label="Cuentas de OnlyFans disponibles">
                <input
                  className="input"
                  value={f.cuentasOnly || ""}
                  onChange={(e) => set("cuentasOnly", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Cuenta para cobrar (Skrill / Paxum / otra)">
              <input
                className="input"
                value={f.metodoPago || ""}
                onChange={(e) => set("metodoPago", e.target.value)}
              />
            </Field>
            <Field label="Experiencia previa">
              <textarea
                className="input"
                rows={2}
                value={f.experiencia || ""}
                onChange={(e) => set("experiencia", e.target.value)}
              />
            </Field>
            <Field label="¿Contenido hecho? ¿Cuánto tenés?">
              <textarea
                className="input"
                rows={2}
                value={f.contenidoHecho || ""}
                onChange={(e) => set("contenidoHecho", e.target.value)}
              />
            </Field>
            <Field label="¿Dónde harías el contenido que la agencia te pida?">
              <input
                className="input"
                value={f.dondeContenido || ""}
                onChange={(e) => set("dondeContenido", e.target.value)}
              />
            </Field>
            <Field label="¿Tatuajes? ¿Cuántos?">
              <input
                className="input"
                value={f.tatuajes || ""}
                onChange={(e) => set("tatuajes", e.target.value)}
              />
            </Field>
          </Section>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <button className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? "Enviando…" : "Enviar postulación"}
          </button>
          {ref && (
            <p className="text-center text-xs text-sky-100">
              Referida por un asesor de Sky Blue.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = SI_NO,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "—"}
          </option>
        ))}
      </select>
    </div>
  );
}
