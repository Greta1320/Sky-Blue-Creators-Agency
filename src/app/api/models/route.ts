import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
  modelScopeWhere,
} from "@/lib/api";
import { createModelSchema } from "@/lib/validation";
import { MODEL_SOURCE } from "@/lib/constants";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Lista de modelos según visibilidad del rol. ?status=&q= para filtrar.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q")?.trim();

  const where: Record<string, unknown> = { ...modelScopeWhere(user) };
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { stageName: { contains: q } },
      { instagram: { contains: q } },
    ];
  }

  const models = await prisma.model.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      recruiter: { select: { id: true, name: true } },
      // Los dueños de mercado solo se exponen al master.
      marketOwner: isMasterUser(user)
        ? { select: { id: true, name: true, market: true } }
        : false,
    },
    take: 500,
  });

  return jsonWithCors(req, { models });
}

// Crear modelo (manual, formulario o Halcón).
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const body = await req.json().catch(() => ({}));
  const parsed = createModelSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      400
    );
  }
  const data = parsed.data;

  // Un vendedor siempre se auto-asigna como origen; el master puede elegir.
  let recruiterId = user.id;
  if (isMasterUser(user) && data.recruiterId) {
    recruiterId = data.recruiterId;
  }

  const model = await prisma.model.create({
    data: {
      fullName: data.fullName,
      stageName: data.stageName,
      instagram: data.instagram,
      whatsapp: data.whatsapp,
      email: data.email || null,
      age: data.age,
      country: data.country,
      city: data.city,
      languages: data.languages,
      experience: data.experience,
      notes: data.notes,
      recruiterId,
      source: data.source || MODEL_SOURCE.MANUAL,
      status: "PROSPECTADA",
      statusEvents: {
        create: {
          toStatus: "PROSPECTADA",
          note: "Prospecto creado",
          actorId: user.id,
        },
      },
    },
  });

  return jsonWithCors(req, { model }, 201);
}
