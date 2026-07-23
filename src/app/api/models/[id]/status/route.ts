import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { statusSchema } from "@/lib/validation";
import { deriveStatusChange } from "@/lib/pipeline";
import { calcCommission } from "@/lib/commissions";
import { DEFAULT_MARKET_CUT_RATE } from "@/lib/constants";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Cambia la etapa del pipeline y dispara efectos (garantía, comisión).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const model = await prisma.model.findUnique({
    where: { id: params.id },
    include: { marketOwner: true },
  });
  if (!model) return jsonWithCors(req, { error: "No encontrado" }, 404);

  const master = isMasterUser(user);
  if (!master && model.recruiterId !== user.id) {
    return jsonWithCors(req, { error: "Sin permiso" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Estado inválido" }, 400);
  }
  const { status: newStatus, note } = parsed.data;

  // Etapas de cierre/cobro son responsabilidad del master.
  const masterOnlyStages = ["ENVIADA_MERCADO", "COLOCADA", "COBRADA"];
  if (!master && masterOnlyStages.includes(newStatus)) {
    return jsonWithCors(
      req,
      { error: "Esa etapa la gestiona el master" },
      403
    );
  }

  const { data, generateCommission } = deriveStatusChange(model, newStatus);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.model.update({
      where: { id: model.id },
      data,
    });

    await tx.statusEvent.create({
      data: {
        modelId: model.id,
        fromStatus: model.status,
        toStatus: newStatus,
        note: note || null,
        actorId: user.id,
      },
    });

    let commission = null;
    if (generateCommission && model.recruiterId) {
      const existing = await tx.commission.findFirst({
        where: { modelId: model.id },
      });
      if (!existing) {
        // Se crea un BORRADOR con una sugerencia pre-cargada (40% mercado,
        // resto 50/50). Queda en estado PENDIENTE para que Matías la
        // complete/ajuste y la marque como pagada desde el panel de Comisiones.
        const base = model.dealAmount ?? model.price ?? 0;
        const marketCutRate =
          model.marketOwner?.cutRate ?? DEFAULT_MARKET_CUT_RATE;
        const recruiter = await tx.user.findUnique({
          where: { id: model.recruiterId },
        });
        const breakdown = calcCommission(
          base,
          marketCutRate,
          recruiter?.commissionRate ?? 0.5
        );
        commission = await tx.commission.create({
          data: {
            modelId: model.id,
            recruiterId: model.recruiterId,
            dealAmount: breakdown.dealAmount,
            marketCut: breakdown.marketCut,
            netAfterMarket: breakdown.netAfterMarket,
            recruiterShare: breakdown.recruiterShare,
            matiasShare: breakdown.matiasShare,
            status: "PENDIENTE",
          },
        });
      }
    }

    return { updated, commission };
  });

  return jsonWithCors(req, {
    model: result.updated,
    commission: result.commission,
  });
}
