import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Master ve todas las comisiones; el vendedor solo las suyas.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const where = isMasterUser(user) ? {} : { recruiterId: user.id };
  const commissions = await prisma.commission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      model: { select: { id: true, fullName: true, stageName: true } },
      recruiter: { select: { id: true, name: true } },
    },
  });

  const totals = commissions.reduce(
    (acc, c) => {
      acc.recruiterShare += c.recruiterShare;
      acc.matiasShare += c.matiasShare;
      acc.marketCut += c.marketCut;
      if (c.status === "PENDIENTE") acc.pendingRecruiter += c.recruiterShare;
      return acc;
    },
    { recruiterShare: 0, matiasShare: 0, marketCut: 0, pendingRecruiter: 0 }
  );

  return jsonWithCors(req, { commissions, totals });
}
