import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { money } from "@/lib/format";
import { CommissionsTable } from "@/components/CommissionsTable";

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
          {master
            ? "Al cobrar una modelo se crea un borrador con una sugerencia (40% mercado · resto 50/50). Lo completás y ajustás vos antes de pagar."
            : "Tus comisiones. Matías confirma el monto final de cada una."}
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

      <CommissionsTable
        master={master}
        commissions={JSON.parse(JSON.stringify(commissions))}
      />
    </div>
  );
}
