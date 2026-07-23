import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { buildListing } from "@/lib/listing";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Regenera el listing (formato 🎖️) a partir del formulario de la modelo.
// Solo master.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }

  const model = await prisma.model.findUnique({ where: { id: params.id } });
  if (!model) return jsonWithCors(req, { error: "No encontrado" }, 404);

  let form: Record<string, unknown> = {};
  try {
    form = model.formData ? JSON.parse(model.formData) : {};
  } catch {
    form = {};
  }

  const listingText = buildListing(form, { price: model.price ?? undefined });
  const updated = await prisma.model.update({
    where: { id: model.id },
    data: { listingText },
    select: { id: true, listingText: true },
  });
  return jsonWithCors(req, { model: updated });
}
