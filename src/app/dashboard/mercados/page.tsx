import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { NewMarketOwnerButton } from "@/components/NewMarketOwnerButton";
import { pct } from "@/lib/format";

export default async function MercadosPage() {
  const user = (await getCurrentUser())!;
  if (user.role !== ROLES.MASTER) redirect("/dashboard");

  const owners = await prisma.marketOwner.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dueños de mercado
          </h1>
          <p className="text-sm text-slate-500">
            🔒 Confidencial. Los vendedores nunca ven esta información.
          </p>
        </div>
        <NewMarketOwnerButton />
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {owners.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{o.name}</h3>
                <p className="text-sm text-slate-500">
                  {o.market || "Plaza sin definir"}
                </p>
              </div>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                Corte {pct(o.cutRate)}
              </span>
            </div>
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              {o.contact && (
                <div>
                  <span className="text-slate-400">Contacto: </span>
                  {o.contact}
                </div>
              )}
              {o.groups && (
                <div>
                  <span className="text-slate-400">Grupos: </span>
                  {o.groups}
                </div>
              )}
              <div>
                <span className="text-slate-400">Listings enviados: </span>
                {o._count.models}
              </div>
            </dl>
          </div>
        ))}
        {owners.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-400">
            Todavía no hay dueños de mercado cargados.
          </p>
        )}
      </div>
    </div>
  );
}
