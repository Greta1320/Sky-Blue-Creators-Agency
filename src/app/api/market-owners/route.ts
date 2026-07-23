import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { marketOwnerSchema } from "@/lib/validation";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Los dueños de mercado son EXCLUSIVOS del master (Matías).
// Ningún vendedor tiene acceso a esta información.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Acceso restringido al master" }, 403);
  }

  const owners = await prisma.marketOwner.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { models: true } } },
  });
  return jsonWithCors(req, { owners });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Acceso restringido al master" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = marketOwnerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const owner = await prisma.marketOwner.create({ data: parsed.data });
  return jsonWithCors(req, { owner }, 201);
}
