import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { ModelDetail } from "@/components/ModelDetail";

export default async function ModelPage({
  params,
}: {
  params: { id: string };
}) {
  const user = (await getCurrentUser())!;
  const master = user.role === ROLES.MASTER;

  const model = await prisma.model.findUnique({
    where: { id: params.id },
    include: {
      recruiter: { select: { id: true, name: true } },
      statusEvents: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!model) notFound();
  // Scope: un vendedor solo ve las suyas.
  if (!master && model.recruiterId !== user.id) notFound();

  const marketOwners = master
    ? await prisma.marketOwner.findMany({
        where: { active: true },
        select: { id: true, name: true, cutRate: true },
      })
    : [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/modelos"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Modelos
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          {model.stageName || model.fullName}
        </h1>
        <p className="text-sm text-slate-500">
          {model.instagram && <span>{model.instagram} · </span>}
          {model.country || "País no cargado"}
          {master && model.recruiter && (
            <span> · Vendedor: {model.recruiter.name}</span>
          )}
        </p>
      </div>

      <ModelDetail
        master={master}
        model={JSON.parse(JSON.stringify(model))}
        marketOwners={marketOwners}
      />
    </div>
  );
}
