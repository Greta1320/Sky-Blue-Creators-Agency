"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(900px 500px at 80% -10%, rgba(74,144,205,0.35), transparent 55%), radial-gradient(700px 480px at 0% 110%, rgba(47,119,189,0.3), transparent 55%), linear-gradient(160deg, #0f2c4d 0%, #123a63 55%, #0c2440 100%)",
      }}
    >
      {/* Barras decorativas del logo, gigantes y sutiles */}
      <div className="pointer-events-none absolute -right-10 bottom-0 flex items-end gap-6 opacity-[0.07]">
        <div className="h-64 w-24 rounded-t-3xl bg-sky-300" />
        <div className="h-96 w-24 rounded-t-3xl bg-sky-400" />
        <div className="h-[34rem] w-24 rounded-t-3xl bg-sky-200" />
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/95 p-8 shadow-[0_24px_80px_-24px_rgba(2,12,27,0.7)] backdrop-blur">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_-8px_rgba(15,44,77,0.35)] ring-1 ring-slate-100">
            <Logo size={40} />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-sky-900">
            Sky Blue Creators
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Panel de administración
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Acceso exclusivo del equipo Sky Blue · Conexión segura
        </p>
      </div>
    </main>
  );
}
