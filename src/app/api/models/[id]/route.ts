import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { updateModelSchema } from "@/lib/validation";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

async function loadVisibleModel(userId: string, isMaster: boolean, id: string) {
  const model = await prisma.model.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, name: true } },
      marketOwner: isMaster,
      statusEvents: { orderBy: { createdAt: "desc" }, take: 50 },
      commissions: true,
    },
  });
  if (!model) return null;
  if (!isMaster && model.recruiterId !== userId) return null; // fuera de scope
  return model;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const model = await loadVisibleModel(user.id, isMasterUser(user), params.id);
  if (!model) return jsonWithCors(req, { error: "No encontrado" }, 404);

  // Ocultar mercado a los vendedores por las dudas.
  if (!isMasterUser(user)) {
    (model as Record<string, unknown>).marketOwner = undefined;
    (model as Record<string, unknown>).marketOwnerId = undefined;
  }
  return jsonWithCors(req, { model });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const existing = await prisma.model.findUnique({ where: { id: params.id } });
  if (!existing) return jsonWithCors(req, { error: "No encontrado" }, 404);

  const master = isMasterUser(user);
  if (!master && existing.recruiterId !== user.id) {
    return jsonWithCors(req, { error: "Sin permiso" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = updateModelSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      400
    );
  }
  const d = parsed.data;

  // Campos exclusivos del master (precio, listing, mercado, cierre, reasignar).
  const masterOnly = [
    "price",
    "listingText",
    "listingApproved",
    "agency",
    "dealType",
    "dealAmount",
    "marketOwnerId",
    "recruiterId",
  ] as const;
  if (!master) {
    for (const key of masterOnly) {
      if (key in d && (d as Record<string, unknown>)[key] !== undefined) {
        return jsonWithCors(
          req,
          { error: `El campo "${key}" solo puede editarlo el master` },
          403
        );
      }
    }
  }

  const model = await prisma.model.update({
    where: { id: params.id },
    data: {
      ...d,
      email: d.email === "" ? null : d.email,
    },
  });
  return jsonWithCors(req, { model });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master puede eliminar" }, 403);
  }
  await prisma.model.delete({ where: { id: params.id } });
  return jsonWithCors(req, { ok: true });
}
