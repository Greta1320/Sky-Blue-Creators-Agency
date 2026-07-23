import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMetrics } from "@/lib/metrics";
import { ROLES, MODEL_STATUS, STATUS_LABELS } from "@/lib/constants";
import { money, pct, dateShort } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const master = user.role === ROLES.MASTER;
  const metrics = await getMetrics(user);

  const maxCount = Math.max(
    1,
    ...MODEL_STATUS.map((s) => metrics.statusCounts[s] || 0)
  );

  const recruiterCount = master
    ? await prisma.user.count({ where: { role: "RECRUITER" } })
    : 0;

  // Nuevas postulaciones (formulario web) para el master.
  const nuevasPostulaciones = master
    ? await prisma.model.findMany({
        where: { source: "FORM", status: "FORMULARIO_COMPLETO" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          fullName: true,
          country: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {master ? "Panel Master" : "Mi panel"}
        </h1>
        <p className="text-sm text-slate-500">
          {master
            ? "Vista completa de toda la operación: modelos, vendedores y comisiones."
            : "Tus modelos, tu pipeline y tus comisiones."}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label={master ? "Modelos totales" : "Mis modelos"}
          value={String(metrics.total)}
        />
        <Stat
          label="Colocadas"
          value={String(metrics.placed + metrics.cobrada)}
          hint={`Conversión ${pct(metrics.conversionRate)}`}
        />
        <Stat
          label="En garantía (7d)"
          value={String(metrics.enGarantia)}
          hint="Ventana activa"
        />
        {master ? (
          <Stat label="Vendedores activos" value={String(recruiterCount)} />
        ) : (
          <Stat
            label="Comisión acumulada"
            value={money(metrics.earnings.recruiter)}
            hint={`${money(metrics.earnings.pending)} pendiente`}
          />
        )}
      </section>

      {master && (
        <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Comisión vendedores"
            value={money(metrics.earnings.recruiter)}
          />
          <Stat
            label="Parte Matías"
            value={money(metrics.earnings.matias)}
          />
          <Stat
            label="Pendiente de pago"
            value={money(metrics.earnings.pending)}
          />
          <Stat label="Cobradas" value={String(metrics.cobrada)} />
        </section>
      )}

      {/* Nuevas postulaciones (aviso al master) */}
      {master && nuevasPostulaciones.length > 0 && (
        <section className="card mt-6 border-sky-200 bg-sky-50/40 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            🔔 Nuevas postulaciones
            <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">
              {nuevasPostulaciones.length}
            </span>
          </h2>
          <ul className="divide-y divide-sky-100">
            {nuevasPostulaciones.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/modelos/${m.id}`}
                    className="font-medium text-sky-700 hover:underline"
                  >
                    {m.fullName}
                  </Link>
                  <span className="text-slate-400">
                    {" "}
                    · {m.country || "país s/d"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {dateShort(m.createdAt)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Entrá a cada una, revisá el listing 🎖️ generado, ponéle precio y
            enviálo por Telegram.
          </p>
        </section>
      )}

      {/* Funnel */}
      <section className="card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Funnel del pipeline
        </h2>
        <div className="space-y-3">
          {MODEL_STATUS.map((s) => {
            const count = metrics.statusCounts[s] || 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <div className="w-44 shrink-0 text-sm text-slate-600">
                  {STATUS_LABELS[s]}
                </div>
                <div className="h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="flex h-full items-center justify-end rounded-full bg-sky-500 pr-2 text-xs font-medium text-white"
                    style={{ width: `${Math.max(6, (count / maxCount) * 100)}%` }}
                  >
                    {count > 0 && count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
