import { prisma } from "./prisma";
import { ROLES } from "./constants";
import type { User } from "@prisma/client";

/**
 * Métricas del funnel según el alcance del usuario.
 * Master ve todo; el vendedor solo lo suyo.
 */
export async function getMetrics(user: User) {
  const scope =
    user.role === ROLES.MASTER ? {} : { recruiterId: user.id };

  const [byStatus, total, placed, cobrada, enGarantia, commissions] =
    await Promise.all([
      prisma.model.groupBy({
        by: ["status"],
        where: scope,
        _count: { _all: true },
      }),
      prisma.model.count({ where: scope }),
      prisma.model.count({ where: { ...scope, status: "COLOCADA" } }),
      prisma.model.count({ where: { ...scope, status: "COBRADA" } }),
      prisma.model.count({
        where: { ...scope, guaranteeStatus: "EN_CURSO" },
      }),
      prisma.commission.findMany({
        where: user.role === ROLES.MASTER ? {} : { recruiterId: user.id },
        select: { recruiterShare: true, matiasShare: true, status: true },
      }),
    ]);

  const statusCounts: Record<string, number> = {};
  for (const row of byStatus) {
    statusCounts[row.status] = row._count._all;
  }

  const prospectadas =
    (statusCounts["PROSPECTADA"] || 0) +
    (statusCounts["FORMULARIO_COMPLETO"] || 0);
  const conversionRate = total > 0 ? placed / total : 0;

  const earnings = commissions.reduce(
    (acc, c) => {
      acc.recruiter += c.recruiterShare;
      acc.matias += c.matiasShare;
      if (c.status === "PENDIENTE") acc.pending += c.recruiterShare;
      return acc;
    },
    { recruiter: 0, matias: 0, pending: 0 }
  );

  return {
    total,
    statusCounts,
    prospectadas,
    placed,
    cobrada,
    enGarantia,
    conversionRate,
    earnings,
  };
}
