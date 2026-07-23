import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
} from "@/lib/api";
import { z } from "zod";
import { MODEL_SOURCE } from "@/lib/constants";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

const captureSchema = z.object({
  fullName: z.string().min(1, "Nombre o @ requerido"),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  sourceUrl: z.string().optional(),
});

// Captura rápida desde la extensión Halcón (1 clic en Instagram/WhatsApp Web).
// Requiere bearer token del vendedor. La modelo entra como PROSPECTADA
// auto-asignada a quien la capturó.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const body = await req.json().catch(() => ({}));
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const d = parsed.data;

  const note = [d.notes, d.sourceUrl ? `Origen: ${d.sourceUrl}` : null]
    .filter(Boolean)
    .join(" · ");

  const model = await prisma.model.create({
    data: {
      fullName: d.fullName,
      instagram: d.instagram,
      whatsapp: d.whatsapp,
      country: d.country,
      notes: note || null,
      recruiterId: user.id,
      source: MODEL_SOURCE.HALCON,
      status: "PROSPECTADA",
      statusEvents: {
        create: {
          toStatus: "PROSPECTADA",
          note: "Capturada con Halcón",
          actorId: user.id,
        },
      },
    },
    select: { id: true, fullName: true, instagram: true, status: true },
  });

  // Resumen rápido del pipeline del vendedor para mostrar en el popup.
  const [prospectadas, colocadas, enGarantia] = await Promise.all([
    prisma.model.count({
      where: { recruiterId: user.id, status: "PROSPECTADA" },
    }),
    prisma.model.count({
      where: { recruiterId: user.id, status: "COLOCADA" },
    }),
    prisma.model.count({
      where: { recruiterId: user.id, guaranteeStatus: "EN_CURSO" },
    }),
  ]);

  return jsonWithCors(
    req,
    { model, pipeline: { prospectadas, colocadas, enGarantia } },
    201
  );
}
