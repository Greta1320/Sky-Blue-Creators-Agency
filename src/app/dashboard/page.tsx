import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMetrics } from "@/lib/metrics";
import { ROLES, MODEL_STATUS, STATUS_LABELS } from "@/lib/constants";
import { money, pct, dateShort } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  IconUsers,
  IconTrend,
  IconClock,
  IconTeam,
  IconCoins,
  IconWallet,
  IconShield,
  IconBell,
} from "@/components/icons";

const ACCENTS: Record<string, string> = {
  sky: "from-sky-500/15 to-sky-500/5 text-sky-700",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-600",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-600",
  navy: "from-sky-900/15 to-sky-900/5 text-sky-900",
};

function Stat({
  label,
  value,
  hint,
  icon,
  accent = "sky",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-[28px] font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-700 text-[11px] font-bold text-white shadow-sm">
      {initials}
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

  const nuevasPostulaciones = master
    ? await prisma.model.findMany({
        where: { source: "FORM", status: "FORMULARIO_COMPLETO" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, fullName: true, country: true, createdAt: true },
      })
    : [];

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium capitalize text-slate-400">
            {hoy}
          </p>
          <h1 className="mt-0.5 text-[26px] font-bold tracking-tight text-slate-900">
            {master
              ? `Hola, ${user.name.split(" ")[0]} 👋`
              : `Hola, ${user.name.split(" ")[0]}`}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {master
              ? "Vista completa de la operación: modelos, vendedores y comisiones."
              : "Tus modelos, tu pipeline y tus comisiones."}
          </p>
        </div>
        <Link href="/dashboard/modelos" className="btn-primary">
          Ver modelos
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label={master ? "Modelos totales" : "Mis modelos"}
          value={String(metrics.total)}
          icon={<IconUsers />}
          accent="sky"
        />
        <Stat
          label="Colocadas"
          value={String(metrics.placed + metrics.cobrada)}
          hint={`Conversión ${pct(metrics.conversionRate)}`}
          icon={<IconTrend />}
          accent="emerald"
        />
        <Stat
          label="En garantía (7d)"
          value={String(metrics.enGarantia)}
          hint="Ventana activa"
          icon={<IconClock />}
          accent="amber"
        />
        {master ? (
          <Stat
            label="Vendedores activos"
            value={String(recruiterCount)}
            icon={<IconTeam />}
            accent="violet"
          />
        ) : (
          <Stat
            label="Comisión acumulada"
            value={money(metrics.earnings.recruiter)}
            hint={`${money(metrics.earnings.pending)} pendiente`}
            icon={<IconCoins />}
            accent="emerald"
          />
        )}
      </section>

      {master && (
        <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Comisión vendedores"
            value={money(metrics.earnings.recruiter)}
            icon={<IconCoins />}
            accent="sky"
          />
          <Stat
            label="Parte Matías"
            value={money(metrics.earnings.matias)}
            icon={<IconWallet />}
            accent="navy"
          />
          <Stat
            label="Pendiente de pago"
            value={money(metrics.earnings.pending)}
            icon={<IconClock />}
            accent="amber"
          />
          <Stat
            label="Cobradas"
            value={String(metrics.cobrada)}
            icon={<IconShield />}
            accent="emerald"
          />
        </section>
      )}

      {/* Nuevas postulaciones */}
      {master && nuevasPostulaciones.length > 0 && (
        <section className="card mt-6 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent px-6 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-sky-500/5 text-sky-700">
              <IconBell />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Nuevas postulaciones
              </h2>
              <p className="text-xs text-slate-500">
                Revisá el listing generado, poné el precio y envialo al mercado.
              </p>
            </div>
            <span className="ml-auto rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              {nuevasPostulaciones.length}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {nuevasPostulaciones.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/dashboard/modelos/${m.id}`}
                  className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-sky-50/60"
                >
                  <Avatar name={m.fullName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {m.fullName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.country || "País s/d"} · {dateShort(m.createdAt)}
                    </p>
                  </div>
                  <span className="ml-auto text-[13px] font-semibold text-sky-700">
                    Revisar →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Funnel */}
      <section className="card mt-6 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Funnel del pipeline
            </h2>
            <p className="text-xs text-slate-500">
              De prospección a cobro, en tiempo real.
            </p>
          </div>
        </div>
        <div className="space-y-3.5">
          {MODEL_STATUS.map((s, i) => {
            const count = metrics.statusCounts[s] || 0;
            const width = Math.max(4, (count / maxCount) * 100);
            return (
              <div key={s} className="flex items-center gap-4">
                <div className="w-44 shrink-0 text-[13px] font-medium text-slate-600">
                  {STATUS_LABELS[s]}
                </div>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100/80">
                  <div
                    className="flex h-full items-center justify-end rounded-lg pr-2.5 text-xs font-bold text-white transition-[width] duration-700"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, #4a90cd, ${
                        i >= 4 ? "#0f2c4d" : "#1e63a6"
                      })`,
                      boxShadow:
                        count > 0
                          ? "0 4px 12px -4px rgba(30,99,166,0.5)"
                          : "none",
                      opacity: count > 0 ? 1 : 0.25,
                    }}
                  >
                    {count > 0 && count}
                  </div>
                </div>
                <div className="w-10 shrink-0 text-right text-xs font-semibold text-slate-400">
                  {metrics.total > 0
                    ? `${Math.round((count / metrics.total) * 100)}%`
                    : "0%"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
