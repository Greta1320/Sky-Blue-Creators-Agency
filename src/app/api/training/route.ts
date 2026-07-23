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

// Kit de formación/prospección (scripts, FAQs, ideas de contenido).
// Lo leen tanto la web como la extensión Halcón. Cualquier usuario autenticado.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const resources = await prisma.trainingResource.findMany({
    where: { active: true },
    orderBy: [{ kind: "asc" }, { order: "asc" }],
  });
  return jsonWithCors(req, { resources });
}

const resourceSchema = z.object({
  kind: z.enum(["SCRIPT", "FAQ", "CONTENT_IDEA"]),
  title: z.string().min(1),
  body: z.string().min(1),
  order: z.coerce.number().int().optional(),
});

// Solo el master administra el kit.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }
  const body = await req.json().catch(() => ({}));
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const resource = await prisma.trainingResource.create({
    data: { ...parsed.data, order: parsed.data.order ?? 0 },
  });
  return jsonWithCors(req, { resource }, 201);
}
