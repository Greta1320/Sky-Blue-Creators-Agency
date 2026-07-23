import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { money } from "@/lib/format";

export default async function ComisionesPage() {
  const user = (await getCurrentUser())!;
  const master = user.role === ROLES.MASTER;

  const commissions = await prisma.commission.findMany({
    where: master ? {} : { recruiterId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      model: { select: { id: true, fullName: true, stageName: true } },
      recruiter: { select: { name: true } },
    },
  });

  const totals = commissions.reduce(
    (a, c) => {
      a.recruiter += c.recruiterShare;
      a.matias += c.matiasShare;
      a.market += c.marketCut;
      if (c.status === "PENDIENTE") a.pending += c.recruiterShare;
      return a;
    },
    { recruiter: 0, matias: 0, market: 0, pending: 0 }
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Comisiones</h1>
        <p className="text-sm text-slate-500">
          40% dueño de mercado · resto 50/50 Matías / vendedor, tras cumplir la
          garantía de 7 días.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">
            {master ? "Total vendedores" : "Mi comisión total"}
          </p>
          <p className="mt-1 text-2xl font-bold text-sky-700">
            {money(totals.recruiter)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Pendiente de pago</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            {money(totals.pending)}
          </p>
        </div>
        {master && (
          <>
            <div className="card p-5">
              <p className="text-sm text-slate-500">Parte Matías</p>
              <p className="mt-1 text-2xl font-bold">{money(totals.matias)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-slate-500">Corte dueños de mercado</p>
              <p className="mt-1 text-2xl font-bold">{money(totals.market)}</p>
            </div>
          </>
        )}
      </section>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              {master && <th className="px-4 py-3">Vendedor</th>}
              <th className="px-4 py-3">Acuerdo</th>
              <th className="px-4 py-3">Mercado</th>
              <th className="px-4 py-3">Vendedor</th>
              {master && <th className="px-4 py-3">Matías</th>}
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {commissions.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  {c.model.stageName || c.model.fullName}
                </td>
                {master && (
                  <td className="px-4 py-3 text-slate-600">
                    {c.recruiter.name}
                  </td>
                )}
                <td className="px-4 py-3">{money(c.dealAmount)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {money(c.marketCut)}
                </td>
                <td className="px-4 py-3 font-semibold text-sky-700">
                  {money(c.recruiterShare)}
                </td>
                {master && (
                  <td className="px-4 py-3">{money(c.matiasShare)}</td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "PAGADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {c.status === "PAGADA" ? "Pagada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td
                  colSpan={master ? 7 : 4}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Todavía no hay comisiones. Se generan al marcar una modelo como
                  “Cobrada”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
