import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { NewRecruiterButton } from "@/components/NewRecruiterButton";
import { money, pct } from "@/lib/format";

export default async function VendedoresPage() {
  const user = (await getCurrentUser())!;
  if (user.role !== ROLES.MASTER) redirect("/dashboard");

  const recruiters = await prisma.user.findMany({
    where: { role: "RECRUITER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modelsOriginated: true } },
      commissions: { select: { recruiterShare: true, status: true } },
    },
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendedores</h1>
          <p className="text-sm text-slate-500">
            Tu equipo. Ves todo lo que originan hacia abajo.
          </p>
        </div>
        <NewRecruiterButton />
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Modelos</th>
              <th className="px-4 py-3">Comisión</th>
              <th className="px-4 py-3">Ganado</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recruiters.map((r) => {
              const earned = r.commissions.reduce(
                (s, c) => s + c.recruiterShare,
                0
              );
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.email}</td>
                  <td className="px-4 py-3">{r._count.modelsOriginated}</td>
                  <td className="px-4 py-3">{pct(r.commissionRate)}</td>
                  <td className="px-4 py-3 font-semibold text-sky-700">
                    {money(earned)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {recruiters.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Todavía no hay vendedores. Creá el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
