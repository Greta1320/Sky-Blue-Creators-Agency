import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { z } from "zod";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

const updateSchema = z.object({
  dealAmount: z.coerce.number().min(0).optional(),
  marketCut: z.coerce.number().min(0).optional(),
  recruiterShare: z.coerce.number().min(0).optional(),
  matiasShare: z.coerce.number().min(0).optional(),
  status: z.enum(["PENDIENTE", "PAGADA"]).optional(),
});

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Solo Matías (master) completa/ajusta y paga las comisiones.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }

  const existing = await prisma.commission.findUnique({
    where: { id: params.id },
  });
  if (!existing) return jsonWithCors(req, { error: "No encontrada" }, 404);

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const d = parsed.data;

  const dealAmount = d.dealAmount ?? existing.dealAmount;
  const marketCut = d.marketCut ?? existing.marketCut;
  const recruiterShare = d.recruiterShare ?? existing.recruiterShare;
  const matiasShare = d.matiasShare ?? existing.matiasShare;

  const commission = await prisma.commission.update({
    where: { id: params.id },
    data: {
      dealAmount: round2(dealAmount),
      marketCut: round2(marketCut),
      netAfterMarket: round2(dealAmount - marketCut),
      recruiterShare: round2(recruiterShare),
      matiasShare: round2(matiasShare),
      status: d.status ?? existing.status,
      paidAt:
        d.status === "PAGADA"
          ? existing.paidAt ?? new Date()
          : d.status === "PENDIENTE"
            ? null
            : existing.paidAt,
    },
  });

  return jsonWithCors(req, { commission });
}
