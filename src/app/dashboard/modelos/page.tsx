import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { NewModelButton } from "@/components/NewModelButton";
import { money, dateShort } from "@/lib/format";
import { guaranteeDaysLeft } from "@/lib/pipeline";

export default async function ModelosPage() {
  const user = (await getCurrentUser())!;
  const master = user.role === ROLES.MASTER;

  const models = await prisma.model.findMany({
    where: master ? {} : { recruiterId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { recruiter: { select: { name: true } } },
    take: 500,
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Modelos</h1>
          <p className="text-sm text-slate-500">
            {models.length} {master ? "en total" : "asignadas a vos"}
          </p>
        </div>
        <NewModelButton />
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Estado</th>
              {master && <th className="px-4 py-3">Vendedor</th>}
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Garantía</th>
              <th className="px-4 py-3">Actualizada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map((m) => {
              const daysLeft = guaranteeDaysLeft(m);
              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/modelos/${m.id}`}
                      className="font-medium text-sky-700 hover:underline"
                    >
                      {m.stageName || m.fullName}
                    </Link>
                    {m.instagram && (
                      <p className="text-xs text-slate-400">{m.instagram}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  {master && (
                    <td className="px-4 py-3 text-slate-600">
                      {m.recruiter?.name || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-600">{money(m.price)}</td>
                  <td className="px-4 py-3">
                    {daysLeft != null ? (
                      <span
                        className={
                          daysLeft < 0
                            ? "text-rose-600"
                            : daysLeft <= 2
                              ? "text-orange-600"
                              : "text-slate-600"
                        }
                      >
                        {daysLeft < 0
                          ? "Vencida"
                          : `${daysLeft} día${daysLeft === 1 ? "" : "s"}`}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {dateShort(m.updatedAt)}
                  </td>
                </tr>
              );
            })}
            {models.length === 0 && (
              <tr>
                <td
                  colSpan={master ? 6 : 5}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Todavía no hay modelos. Creá una o capturá prospectos con
                  Halcón.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
